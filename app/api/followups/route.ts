import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const CreateFollowup = z
  .object({
    support_strategy_id: z.string().uuid(),
    baseline_attempt_id: z.string().uuid(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CreateFollowup.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const repo = getRepository();
  const strategy = await repo.getStrategy(parsed.data.support_strategy_id);
  if (!strategy) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const investigation = await repo.getInvestigation(strategy.investigation_id);
  const baseline = await repo.getAttempt(parsed.data.baseline_attempt_id);
  if (!investigation || !baseline || baseline.learner_id !== investigation.learner_id) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const followup = await repo.createFollowup({
    support_strategy_id: strategy.id,
    baseline_attempt_id: baseline.id,
    followup_attempt_id: null,
    comparison: null,
    teacher_notes: null,
    decision: null,
  });
  return NextResponse.json({ followup }, { status: 201 });
}
