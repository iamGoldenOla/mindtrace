import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const CreateObservation = z
  .object({
    category: z.string().max(40).optional(),
    context: z.string().max(300).optional(),
    behaviour: z.string().min(1).max(1000),
    frequency: z.string().max(60).optional(),
    source: z.enum(["teacher_report", "parent_report", "observed", "assessment"]),
    observed_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  })
  .strict();

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  try {
    await requireLearnerAccess(user.id, params.id);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const observations = await getRepository().listObservations(params.id);
  return NextResponse.json({ observations });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  try {
    await requireLearnerAccess(user.id, params.id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const parsed = CreateObservation.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const observation = await getRepository().createObservation({
    learner_id: params.id,
    author_id: user.id,
    observed_on: parsed.data.observed_on ?? new Date().toISOString().slice(0, 10),
    category: parsed.data.category ?? null,
    context: parsed.data.context ?? null,
    behaviour: parsed.data.behaviour,
    frequency: parsed.data.frequency ?? null,
    source: parsed.data.source,
  });
  return NextResponse.json({ observation }, { status: 201 });
}
