import { NextResponse } from "next/server";
import { devAuthEnabled, signOutDev } from "@/lib/auth/dev";

export async function POST() {
  if (!devAuthEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await signOutDev();
  return NextResponse.json({ ok: true });
}
