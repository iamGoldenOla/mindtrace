import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const CorrectTranscript = z
  .object({ transcript: z.string().min(1).max(2000) })
  .strict();

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CorrectTranscript.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const repo = getRepository();
  const attempt = await repo.getAttempt(params.id);
  if (!attempt) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, attempt.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const text = parsed.data.transcript.trim();
  const updated =
    attempt.transcript === null
      ? await repo.updateAttempt(attempt.id, {
          transcript: text,
          asr_status: "manual",
          status: "completed",
          completed_at: new Date().toISOString(),
        })
      : await repo.updateAttempt(attempt.id, { transcript_corrected: text });
  return NextResponse.json({ attempt: updated });
}
