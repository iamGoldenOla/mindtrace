import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { getEvidenceView } from "@/lib/reading/evidence-view";
import type { WordOutcome } from "@/lib/reading/align";
import type { ReportV1 } from "@/lib/ai/schema";
import supportsCatalog from "@/content/supports.json";
import { ReportView } from "./report-view";

export default async function ReportPage({ params }: { params: { id: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const repo = getRepository();
  const stored = await repo.getReport(params.id);
  if (!stored) notFound();
  const investigation = await repo.getInvestigation(stored.investigation_id);
  if (!investigation) notFound();
  try {
    await requireLearnerAccess(user.id, investigation.learner_id);
  } catch {
    notFound();
  }
  const learner = await repo.getLearner(investigation.learner_id);
  const report = stored.report as unknown as ReportV1;
  const verification = stored.verification as { passed?: boolean };

  const attemptIds = await repo.listAttemptIds(investigation.id);
  const traces: { attemptLabel: string; records: WordOutcome[]; teacherEdited: boolean }[] = [];
  const lookup: Record<string, { target: string | null; observed: string | null; outcome: string; category: string | null; attemptLabel: string }> = {};
  for (const aid of attemptIds) {
    const attempt = await repo.getAttempt(aid);
    if (!attempt) continue;
    const definition = await repo.getDefinition(attempt.definition_id);
    if (!definition) continue;
    const view = getEvidenceView(attempt, definition);
    if (!view) continue;
    const label = `Form ${definition.form ?? "?"} (${attempt.condition})`;
    traces.push({ attemptLabel: label, records: view.records, teacherEdited: view.teacherEdited });
    for (const r of view.records) {
      lookup[r.evidenceId] = {
        target: r.target ?? null,
        observed: r.observed ?? null,
        outcome: r.outcome,
        category: r.category ?? null,
        attemptLabel: label,
      };
    }
  }

  const supportNames: Record<string, string> = {};
  for (const s of (supportsCatalog as { supports: { key: string; name: string }[] }).supports) {
    supportNames[s.key] = s.name;
  }
  const resources = [];
  for (const rec of report.resource_recommendations ?? []) {
    const r = await repo.getResource(rec.resource_id);
    if (r) resources.push({ id: r.id, title: r.title, publisher: r.publisher, practical_action: r.practical_action, reason: rec.reason, url: r.url });
  }
  const runs = await repo.listRunsByInvestigation(investigation.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <ReportView
        learnerCode={learner?.code ?? "unknown"}
        investigationId={investigation.id}
        reportId={stored.id}
        report={JSON.parse(JSON.stringify(report))}
        verificationPassed={verification.passed ?? false}
        reviewStatus={stored.review_status}
        traces={JSON.parse(JSON.stringify(traces))}
        lookup={lookup}
        supportNames={supportNames}
        resources={resources}
        runs={runs.map((r) => ({ kind: r.kind, model: r.model, prompt_version: r.prompt_version, status: r.status }))}
      />
    </main>
  );
}
