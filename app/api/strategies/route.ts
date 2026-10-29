import { NextResponse } from "next/server";
import { z } from "zod";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import supportsCatalog from "@/content/supports.json";

const CreateStrategy = z
  .object({
    investigation_id: z.string().uuid(),
    catalog_key: z.string().min(1).max(60),
    target: z.string().max(300).optional(),
    rationale: z.string().max(500).optional(),
  })
  .strict();

export async function POST(req: Request) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const parsed = CreateStrategy.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const catalog = (supportsCatalog as { supports: { key: string; description: string }[] }).supports;
  const entry = catalog.find((s) => s.key === parsed.data.catalog_key);
  if (!entry) {
    return NextResponse.json({ error: "Unknown support." }, { status: 400 });
  }
  const repo = getRepository();
  const investigation = await repo.getInvestigation(parsed.data.investigation_id);
  if (!investigation) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const strategy = await repo.createStrategy({
    investigation_id: investigation.id,
    catalog_key: entry.key,
    description: entry.description,
    target: parsed.data.target ?? null,
    rationale: parsed.data.rationale ?? null,
    start_date: new Date().toISOString().slice(0, 10),
    status: "active",
    created_by: user.id,
  });
  await repo.updateInvestigation(investigation.id, { status: "support_active" });
  return NextResponse.json({ strategy }, { status: 201 });
}
