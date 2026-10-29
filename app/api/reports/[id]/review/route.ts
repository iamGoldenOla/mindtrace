import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";

const Review = z
  .object({ status: z.enum(["approved", "rejected"]) })
  .strict();

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = Review.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const repo = getRepository();
  const report = await repo.getReport(params.id);
  if (!report) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const investigation = await repo.getInvestigation(report.investigation_id);
  if (!investigation) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const updated = await repo.reviewReport(report.id, parsed.data.status, user.id);
  return NextResponse.json({ report: updated });
}
