import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const LinkAttempt = z
  .object({
    attempt_id: z.string().uuid(),
  })
  .strict();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const repo = getRepository();
  const investigation = await repo.getInvestigation(params.id);
  if (!investigation) return NextResponse.json({ error: "Investigation not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const parsed = LinkAttempt.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const attempt = await repo.getAttempt(parsed.data.attempt_id);
  if (!attempt || attempt.learner_id !== investigation.learner_id) {
    return NextResponse.json({ error: "Attempt not found for this learner." }, { status: 404 });
  }

  await repo.linkAttempt(investigation.id, attempt.id);
  return NextResponse.json({ ok: true, linked: attempt.id }, { status: 200 });
}

