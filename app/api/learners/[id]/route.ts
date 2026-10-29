import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  try {
    await requireLearnerAccess(user.id, params.id);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const learner = await getRepository().getLearner(params.id);
  if (!learner) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ learner });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const repo = getRepository();
  const access = await repo.getAccess(user.id, params.id);
  if (!access || access.access_role !== "owner") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await repo.deleteLearner(params.id, user.id);
  return NextResponse.json({ ok: true });
}
