import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";

export async function GET() {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const resources = await getRepository().listResources();
  return NextResponse.json({ resources });
}
