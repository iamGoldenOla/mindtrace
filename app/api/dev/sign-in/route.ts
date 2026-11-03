// DEV-ONLY sign-in. 404 unless dev auth is enabled (always on outside
// production; on a deployment only with ALLOW_DEV_AUTH=true).
import { NextResponse } from "next/server";
import { z } from "zod";
import { devAuthEnabled, signInDev } from "@/lib/auth/dev";

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  if (!devAuthEnabled()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    const user = await signInDev(parsed.data.email);
    return NextResponse.json({ ok: true, user });
  } catch (err) {
    // Unknown account is the caller's problem (seed the demo data first).
    // Anything else is a server problem: log it and report 500 so the
    // client never mistakes a broken store for a missing account.
    if (err instanceof Error && err.message === "Unknown development account.") {
      return NextResponse.json({ error: "Unknown development account." }, { status: 401 });
    }
    console.error("dev sign-in failed", err);
    return NextResponse.json({ error: "Sign-in failed. Try again." }, { status: 500 });
  }
}
