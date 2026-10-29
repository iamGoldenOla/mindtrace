import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { transcribe } from "@/lib/ai/transcribe";

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

export async function POST(req: Request, { params }: { params: { id: string } }) {
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
  let audio: Buffer;
  let mimeType = "audio/webm";
  try {
    const form = await req.formData();
    const file = form.get("audio");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "No audio was sent. Try again." }, { status: 400 });
    }
    mimeType = file.type || mimeType;
    audio = Buffer.from(await file.arrayBuffer());
  } catch {
    return NextResponse.json({ error: "Could not read the recording. Try again." }, { status: 400 });
  }
  if (audio.length === 0) {
    return NextResponse.json({ error: "The recording was empty. Try again." }, { status: 400 });
  }
  if (audio.length > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "The recording is too long. Keep it under a few minutes." }, { status: 413 });
  }
  // Audio lives only in this buffer. It is sent to transcription and then
  // discarded: never written to disk, storage, or logs.
  try {
    const result = await transcribe(audio, { language: attempt.language, mimeType });
    const text = result.text.trim();
    await repo.updateAttempt(attempt.id, {
      transcript: result.text,
      asr_status: text.length === 0 ? "empty" : "ok",
      status: "completed",
      completed_at: new Date().toISOString(),
    });
    return NextResponse.json({
      transcript: result.text,
      empty: text.length === 0,
      hasWordTiming: !!result.words && result.words.length > 0,
    });
  } catch {
    await repo.updateAttempt(attempt.id, { asr_status: "failed" });
    return NextResponse.json(
      { error: "The recording could not be transcribed. Your attempt was kept. Try again, or type what you heard." },
      { status: 502 }
    );
  }
}
