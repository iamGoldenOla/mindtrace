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
  } catch {
    return NextResponse.json({ error: "Unknown development account." }, { status: 401 });
  }
}
