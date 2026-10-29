import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getEvidenceView } from "@/lib/reading/evidence-view";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const repo = getRepository();
  const attempt = await repo.getAttempt(params.id);
  if (!attempt) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, attempt.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const definition = await repo.getDefinition(attempt.definition_id);
  if (!definition) return NextResponse.json({ error: "Passage form is missing." }, { status: 500 });
  const view = getEvidenceView(attempt, definition);
  if (!view) {
    return NextResponse.json({ error: "There is no transcript yet." }, { status: 400 });
  }
  await repo.replaceResponses(
    attempt.id,
    view.records.map((r) => ({
      evidence_id: r.evidenceId,
      item_ref: r.index >= 0 ? `w${r.index}` : "insertion",
      target: r.target ?? null,
      observed: r.observed ?? null,
      outcome: r.outcome,
      error_category: r.category ?? null,
      hints_used: 0,
      support_used: [],
      response_ms: null,
    }))
  );
  await repo.updateAttempt(attempt.id, { evidence_version: "evidence.v1" });
  return NextResponse.json({ records: view.records, metrics: view.metrics });
}
