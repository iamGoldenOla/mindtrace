import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getEvidenceView } from "@/lib/reading/evidence-view";
import { compare, comparisonSentence } from "@/lib/reading/compare";
import supportsCatalog from "@/content/supports.json";

const UpdateFollowup = z
  .object({
    followup_attempt_id: z.string().uuid().optional(),
    decision: z.enum(["continue", "change", "review", "refer"]).optional(),
    teacher_notes: z.string().max(1000).optional(),
  })
  .strict();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const followup = await getRepository().getFollowup(params.id);
  if (!followup) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ followup });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = UpdateFollowup.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const repo = getRepository();
  const followup = await repo.getFollowup(params.id);
  if (!followup) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const strategy = await repo.getStrategy(followup.support_strategy_id);
  if (!strategy) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const investigation = await repo.getInvestigation(strategy.investigation_id);
  if (!investigation) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const patch: Parameters<typeof repo.updateFollowup>[1] = {};
  if (typeof parsed.data.teacher_notes === "string") patch.teacher_notes = parsed.data.teacher_notes;
  if (parsed.data.decision) patch.decision = parsed.data.decision;

  if (parsed.data.followup_attempt_id) {
    const baseline = await repo.getAttempt(followup.baseline_attempt_id);
    const next = await repo.getAttempt(parsed.data.followup_attempt_id);
    if (!baseline || !next || next.learner_id !== investigation.learner_id || next.status !== "completed") {
      return NextResponse.json({ error: "That follow-up reading cannot be used." }, { status: 400 });
    }
    const defB = await repo.getDefinition(baseline.definition_id);
    const defF = await repo.getDefinition(next.definition_id);
    if (!defB || !defF) {
      return NextResponse.json({ error: "A passage form is missing." }, { status: 500 });
    }
    const viewB = getEvidenceView(baseline, defB);
    const viewF = getEvidenceView(next, defF);
    if (!viewB || !viewF) {
      return NextResponse.json({ error: "Both readings need transcripts first." }, { status: 400 });
    }
    const supportName =
      (supportsCatalog as { supports: { key: string; name: string }[] }).supports.find(
        (s) => s.key === strategy.catalog_key
      )?.name ?? strategy.catalog_key;
    const result = compare(viewB.metrics, viewF.metrics, defB.skill === defF.skill, defB.form !== defF.form);
    patch.followup_attempt_id = next.id;
    patch.comparison = JSON.parse(
      JSON.stringify({
        comparable: result.comparable,
        reasons_not_comparable: result.reasonsNotComparable,
        direction: result.direction,
        sentence: comparisonSentence(supportName, viewB.metrics, viewF.metrics),
        delta_accuracy: result.delta.accuracy,
        caveats: result.caveats,
      })
    ) as Record<string, unknown>;
  }

  const updated = await repo.updateFollowup(followup.id, patch);
  return NextResponse.json({ followup: updated });
}
