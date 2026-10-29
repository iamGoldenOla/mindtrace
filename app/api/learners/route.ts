import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";

const CreateLearner = z
  .object({
    code: z.string().min(1).max(24),
    pseudonym: z.string().max(60).optional(),
    stage: z.string().max(40).optional(),
    preferred_language: z.string().max(12).optional(),
    assessment_language: z.string().max(12).optional(),
  })
  .strict();

export async function GET() {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const learners = await getRepository().listLearnersForUser(user.id);
  return NextResponse.json({ learners });
}

export async function POST(req: Request) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CreateLearner.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const repo = getRepository();
  const existing = await repo.listLearnersForUser(user.id);
  if (existing.some((l) => l.code === parsed.data.code)) {
    return NextResponse.json({ error: "That learner code is already used." }, { status: 409 });
  }
  const learner = await repo.createLearner({
    code: parsed.data.code,
    pseudonym: parsed.data.pseudonym ?? null,
    stage: parsed.data.stage ?? null,
    preferred_language: parsed.data.preferred_language ?? "en",
    assessment_language: parsed.data.assessment_language ?? "en",
    accessibility_prefs: {},
    created_by: user.id,
  });
  await repo.grantAccess({ user_id: user.id, learner_id: learner.id, access_role: "owner", revoked_at: null });
  await repo.logEvent({ actor_id: user.id, action: "learner.create", record_type: "learner", record_id: learner.id });
  return NextResponse.json({ learner }, { status: 201 });
}
