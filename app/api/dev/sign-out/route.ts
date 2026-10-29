import { NextResponse } from "next/server";
import { signOutDev } from "@/lib/auth/dev";

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  await signOutDev();
  return NextResponse.json({ ok: true });
}
