// Bounded tool-calling investigation loop (max 6 rounds) plus verifier.
// Code assembles the evidence; the model interprets it; the verifier and
// deterministic filters decide whether the report may be shown.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { chat, type ChatMessage } from "./provider";
import { TOOL_DEFINITIONS, executeTool } from "./tools";
import { ReportSchema, checkReportRules, SCHEMA_VERSION, type ReportV1 } from "./schema";
import { deterministicFilter, runVerifier } from "./verify";
import { scrubFreeText } from "./scrub";
import { getRepository } from "@/lib/db";
import supportsCatalog from "@/content/supports.json";

const MAX_ROUNDS = 6;
const MODEL = process.env.AI_MODEL_REASONING ?? "muse-spark-1.3";

function investigatorPrompt(): string {
  return readFileSync(new URL("./prompts/investigator.v1", import.meta.url), "utf8");
}

function hashOf(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in model output.");
  return JSON.parse(text.slice(start, end + 1));
}

export type ProgressStage =
  | "Reading evidence"
  | "Checking history"
  | "Weighing explanations"
  | "Verifying claims";

export interface AgentOutcome {
  reportId: string | null;
  passed: boolean;
  problems: string[];
}

export async function runInvestigation(
  investigationId: string,
  onProgress: (stage: ProgressStage) => void | Promise<void>
): Promise<AgentOutcome> {
  const repo = getRepository();
  const started = Date.now();
  const investigation = await repo.getInvestigation(investigationId);
  if (!investigation) throw new Error("Investigation not found.");
  const learner = await repo.getLearner(investigation.learner_id);
  const attemptIds = await repo.listAttemptIds(investigationId);
  const observations = await repo.listObservations(investigation.learner_id);
  const teacherObs = observations.filter((o) => o.source === "teacher_report" || o.source === "observed");

  await onProgress("Reading evidence");
  const ctx = { investigationId, learnerId: investigation.learner_id };
  const evidenceBundle: Record<string, unknown>[] = [];
  for (const attemptId of attemptIds) {
    evidenceBundle.push(await executeTool(ctx, "get_attempt_evidence", { attempt_id: attemptId }));
  }
  const evidenceIds = new Set<string>();
  for (const bundle of evidenceBundle) {
    const records = (bundle as { records?: { id: string }[] }).records ?? [];
    for (const r of records) evidenceIds.add(r.id);
  }
  const supportKeys = new Set(
    (supportsCatalog as { supports: { key: string }[] }).supports.map((s) => s.key)
  );
  const resourceIds = new Set(
    (await repo.listResources()).filter((r) => r.review_status === "reviewed").map((r) => r.id)
  );
  const inputHash = hashOf(JSON.stringify(evidenceBundle));
  const insufficient =
    evidenceBundle.length === 0 ||
    evidenceBundle.every((b) => ((b as { records?: unknown[] }).records ?? []).length === 0);

  const dataBlock = [
    `<learner_context untrusted="true">`,
    `code ${learner?.code ?? "unknown"}, stage ${learner?.stage ?? "unknown"}, `,
    `assessment language ${learner?.assessment_language ?? "en"}.`,
    `Concern: ${scrubFreeText(investigation.concern)}`,
    observations.map((o) => `[${o.source}] ${scrubFreeText(o.behaviour)}`).join("\n"),
    `</learner_context>`,
    ...evidenceBundle.map((b, i) => `<evidence attempt="${i + 1}">\n${JSON.stringify(b)}\n</evidence>`),
    insufficient ? `<note>Evidence is limited. Set insufficient_evidence true if it stays limited.</note>` : "",
  ].join("\n");

  const messages: ChatMessage[] = [
    { role: "system", content: investigatorPrompt() },
    { role: "user", content: dataBlock },
  ];

  let draft: unknown = null;
  let rounds = 0;
  await onProgress("Checking history");
  while (rounds < MAX_ROUNDS) {
    rounds++;
    const res = await chat({ model: MODEL, messages, tools: TOOL_DEFINITIONS });
    if (res.toolCalls.length > 0) {
      messages.push({
        role: "assistant",
        content: res.text,
        tool_calls: res.toolCalls.map((t) => ({
          id: t.id,
          type: "function" as const,
          function: { name: t.name, arguments: t.argumentsJson },
        })),
      });
      for (const call of res.toolCalls) {
        let payload: Record<string, unknown>;
        try {
          const args = JSON.parse(call.argumentsJson) as Record<string, unknown>;
          payload = await executeTool(ctx, call.name, args);
        } catch (err) {
          payload = { error: err instanceof Error ? err.message : "Tool failed." };
        }
        messages.push({ role: "tool", content: JSON.stringify(payload), tool_call_id: call.id });
      }
      if (rounds === 2) await onProgress("Weighing explanations");
      continue;
    }
    draft = extractJson(res.text);
    break;
  }
  if (!draft) throw new Error("The model did not return a report within the step limit.");

  await repo.logRun({
    investigation_id: investigationId,
    kind: "investigate",
    provider: "meta",
    model: MODEL,
    prompt_version: "investigator.v1",
    schema_version: SCHEMA_VERSION,
    input_hash: inputHash,
    status: "ok",
    error: null,
    latency_ms: Date.now() - started,
    tokens_in: null,
    tokens_out: null,
  });

  // Validate, check rules, filter, repair once if needed.
  const problems: string[] = [];
  let report: ReportV1 | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    problems.length = 0;
    const parsed = ReportSchema.safeParse(draft);
    if (!parsed.success) {
      problems.push("Report does not match the required shape.");
    } else {
      report = parsed.data;
      problems.push(
        ...checkReportRules({
          report,
          evidenceIds,
          supportKeys,
          resourceIds,
          attemptCount: attemptIds.length,
          teacherObservationCount: teacherObs.length,
        }),
        ...deterministicFilter(report as unknown as Record<string, unknown>).map(
          (h) => `Blocked wording at ${h.path}: ${h.phrase}.`
        )
      );
    }
    if (problems.length === 0) break;
    if (attempt === 0) {
      const repair = await chat({
        model: MODEL,
        messages: [
          ...messages,
          {
            role: "user",
            content: `Your draft was rejected for these reasons:\n${problems.map((p) => `- ${p}`).join("\n")}\nReply with only the corrected JSON object.`,
          },
        ],
      });
      try {
        draft = extractJson(repair.text);
      } catch {
        problems.push("Repair attempt did not return valid JSON.");
        break;
      }
      report = null;
    }
  }

  await onProgress("Verifying claims");
  if (!report || problems.length > 0) {
    await repo.logRun({
      investigation_id: investigationId,
      kind: "verify",
      provider: "meta",
      model: MODEL,
      prompt_version: "verifier.v1",
      schema_version: SCHEMA_VERSION,
      input_hash: inputHash,
      status: "rejected",
      error: problems.slice(0, 3).join(" | ").slice(0, 200),
      latency_ms: null,
      tokens_in: null,
      tokens_out: null,
    });
    return { reportId: null, passed: false, problems };
  }

  const { result: verdict } = await runVerifier(
    { records: evidenceBundle },
    report as unknown as Record<string, unknown>
  );
  const verifierProblems = [
    ...verdict.unsupported_claims.map((c) => `Unsupported claim at ${c.path}: ${c.reason}`),
    ...verdict.banned_language.map((c) => `Banned wording at ${c.path}: ${c.phrase}`),
    ...verdict.overreach.map((c) => `Overreach at ${c.path}: ${c.reason}`),
  ];
  const passed = verdict.passed && verifierProblems.length === 0;
  await repo.logRun({
    investigation_id: investigationId,
    kind: "verify",
    provider: "meta",
    model: MODEL,
    prompt_version: "verifier.v1",
    schema_version: SCHEMA_VERSION,
    input_hash: inputHash,
    status: passed ? "ok" : "rejected",
    error: passed ? null : verifierProblems.slice(0, 3).join(" | ").slice(0, 200),
    latency_ms: null,
    tokens_in: null,
    tokens_out: null,
  });

  const saved = await repo.createReport({
    investigation_id: investigationId,
    ai_run_id: null,
    report: report as unknown as Record<string, unknown>,
    verification: {
      passed,
      unsupported_claims: verdict.unsupported_claims,
      banned_language: verdict.banned_language,
      overreach: verdict.overreach,
    },
    review_status: "pending_teacher_review",
    reviewed_by: null,
    reviewed_at: null,
  });
  if (passed) {
    await repo.updateInvestigation(investigationId, { status: "report_ready" });
  }
  return { reportId: saved.id, passed, problems: verifierProblems };
}
