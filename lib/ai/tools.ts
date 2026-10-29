// Server-executed agent tools. Narrow by design: they can only read evidence
// for the authorised investigation. IDs in arguments are verified here.
import { getRepository } from "@/lib/db";
import { getEvidenceView } from "@/lib/reading/evidence-view";
import { scrubFreeText } from "./scrub";
import supportsCatalog from "@/content/supports.json";

export interface ToolContext {
  investigationId: string;
  learnerId: string;
}

export const TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_attempt_evidence",
      description: "Read word-level evidence and summary metrics for one attempt in this investigation.",
      parameters: {
        type: "object",
        properties: { attempt_id: { type: "string", description: "Attempt UUID" } },
        required: ["attempt_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_learner_context",
      description: "Read the learner stage, languages, and scrubbed observations with source labels.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_history",
      description: "Read previous attempts, strategies, and follow-up comparisons for this learner.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "list_supports",
      description: "List support catalogue entries for a barrier.",
      parameters: {
        type: "object",
        properties: {
          barrier: { type: "string", enum: ["decoding", "tracking", "vocabulary", "instructions", "format"] },
        },
        required: ["barrier"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_resources",
      description: "List reviewed resources by topic.",
      parameters: {
        type: "object",
        properties: { topic: { type: "string" } },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "propose_followup",
      description: "Propose a matched follow-up form and support. The form must differ from the last attempt.",
      parameters: {
        type: "object",
        properties: {
          form: { type: "string", enum: ["A", "B", "C"] },
          support_key: { type: "string" },
          reason: { type: "string" },
        },
        required: ["form", "support_key", "reason"],
      },
    },
  },
];

export async function executeTool(
  ctx: ToolContext,
  name: string,
  args: Record<string, unknown>
): Promise<Record<string, unknown>> {
  const repo = getRepository();
  switch (name) {
    case "get_attempt_evidence": {
      const attemptId = String(args.attempt_id ?? "");
      const allowed = await repo.listAttemptIds(ctx.investigationId);
      if (!allowed.includes(attemptId)) throw new Error("Attempt is not part of this investigation.");
      const attempt = await repo.getAttempt(attemptId);
      const definition = attempt ? await repo.getDefinition(attempt.definition_id) : null;
      if (!attempt || !definition) throw new Error("Attempt not found.");
      const view = getEvidenceView(attempt, definition);
      if (!view) return { attempt_id: attemptId, evidence: [], note: "No transcript yet." };
      return {
        attempt_id: attemptId,
        form: definition.form,
        condition: attempt.condition,
        evidence_quality: view.metrics.evidenceQuality,
        metrics: {
          words_total: view.metrics.wordsTotal,
          words_correct: view.metrics.wordsCorrect,
          substitutions: view.metrics.substitutions,
          omissions: view.metrics.omissions,
          insertions: view.metrics.insertions,
          category_counts: view.metrics.categoryCounts,
        },
        records: view.records.map((r) => ({
          id: r.evidenceId,
          target: r.target ?? null,
          observed: r.observed ?? null,
          outcome: r.outcome,
          category: r.category ?? null,
        })),
      };
    }
    case "get_learner_context": {
      const learner = await repo.getLearner(ctx.learnerId);
      const observations = await repo.listObservations(ctx.learnerId);
      return {
        code: learner?.code ?? null,
        stage: learner?.stage ?? null,
        assessment_language: learner?.assessment_language ?? null,
        preferred_language: learner?.preferred_language ?? null,
        observations: observations.map((o) => ({
          behaviour: scrubFreeText(o.behaviour),
          source: o.source,
          category: o.category,
          observed_on: o.observed_on,
        })),
      };
    }
    case "get_history": {
      const attempts = await repo.listAttemptsByLearner(ctx.learnerId);
      const investigations = await repo.listInvestigationsByLearner(ctx.learnerId);
      const strategies = [];
      for (const inv of investigations) {
        strategies.push(...(await repo.listStrategiesByInvestigation(inv.id)));
      }
      return {
        attempts: attempts.map((a) => ({
          id: a.id,
          condition: a.condition,
          status: a.status,
          asr_status: a.asr_status,
        })),
        strategies: strategies.map((s) => ({
          catalog_key: s.catalog_key,
          status: s.status,
          start_date: s.start_date,
        })),
      };
    }
    case "list_supports": {
      const barrier = String(args.barrier ?? "");
      const all = (supportsCatalog as { supports: Record<string, unknown>[] }).supports;
      return {
        supports: all
          .filter((s) => (s.barrier as string) === barrier)
          .map((s) => ({
            support_key: s.key,
            name: s.name,
            description: s.description,
            how_to_try: s.how_to_try,
            how_to_evaluate: s.how_to_evaluate,
          })),
      };
    }
    case "list_resources": {
      const topic = String(args.topic ?? "");
      const all = await repo.listResources();
      return {
        resources: all
          .filter((r) => r.review_status === "reviewed" && r.topics.includes(topic))
          .map((r) => ({ resource_id: r.id, title: r.title, publisher: r.publisher, reason_hint: r.practical_action })),
      };
    }
    case "propose_followup": {
      const form = String(args.form ?? "");
      const supportKey = String(args.support_key ?? "");
      const all = (supportsCatalog as { supports: { key: string }[] }).supports;
      if (!all.some((s) => s.key === supportKey)) throw new Error("Unknown support key.");
      const attemptIds = await repo.listAttemptIds(ctx.investigationId);
      const attempts = await repo.listAttemptsByLearner(ctx.learnerId);
      const linked = attempts.filter((a) => attemptIds.includes(a.id));
      const lastForm = linked.length > 0 ? (await repo.getDefinition(linked[0].id))?.form : null;
      if (lastForm === form) throw new Error("Follow-up must use a different matched form.");
      return { form, support_key: supportKey, reason: String(args.reason ?? ""), accepted: true };
    }
    default:
      throw new Error(`Unknown tool: ${name}.`);
  }
}
