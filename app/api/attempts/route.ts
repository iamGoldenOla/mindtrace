import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const CreateAttempt = z
  .object({
    learner_id: z.string().uuid(),
    form: z.enum(["A", "B", "C"]),
    condition: z.enum(["baseline", "support", "followup"]).optional(),
    support_strategy_id: z.string().uuid().optional(),
    language: z.string().max(12).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CreateAttempt.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    await requireLearnerAccess(user.id, parsed.data.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const repo = getRepository();
  const definition = await repo.getDefinitionBySlug(`read-aloud-${parsed.data.form.toLowerCase()}`);
  if (!definition) {
    return NextResponse.json({ error: "Unknown passage form." }, { status: 400 });
  }
  const attempt = await repo.createAttempt({
    learner_id: parsed.data.learner_id,
    definition_id: definition.id,
    language: parsed.data.language ?? "en",
    condition: parsed.data.condition ?? "baseline",
    support_strategy_id: parsed.data.support_strategy_id ?? null,
    status: "in_progress",
    asr_status: null,
    transcript: null,
    transcript_corrected: null,
    evidence_version: null,
    completed_at: null,
    created_by: user.id,
  });
  return NextResponse.json({ attempt, definition }, { status: 201 });
}
