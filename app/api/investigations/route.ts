import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const CreateInvestigation = z
  .object({
    learner_id: z.string().uuid(),
    concern: z.string().min(1).max(1000),
  })
  .strict();

export async function POST(req: Request) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CreateInvestigation.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    await requireLearnerAccess(user.id, parsed.data.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const investigation = await getRepository().createInvestigation({
    learner_id: parsed.data.learner_id,
    concern: parsed.data.concern,
    status: "open",
    created_by: user.id,
  });
  return NextResponse.json({ investigation }, { status: 201 });
}
