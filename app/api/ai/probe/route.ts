import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { chat } from "@/lib/ai/provider";
import { getRepository } from "@/lib/db";
import { DEV_SESSION_COOKIE } from "@/lib/auth/dev-accounts";

const Body = z
  .object({
    prompt: z.string().max(500).optional(),
  })
  .strict();

// The probe spends model credit, so it is disabled entirely in production
// and requires a signed-in development teacher everywhere else. Anonymous
// callers learn nothing about server configuration from the error responses.
async function isSignedIn(): Promise<boolean> {
  if (process.env.NODE_ENV === "production") return false;
  try {
    const jar = await cookies();
    const token = jar.get(DEV_SESSION_COOKIE)?.value;
    if (!token) return false;
    return (await getRepository().getDevSession(token)) !== null;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!(await isSignedIn())) {
    return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  }
  const parsed = Body.safeParse(
    (await req.json().catch(() => ({}))) as unknown
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    const result = await chat({
      messages: [
        {
          role: "user",
          content:
            parsed.data.prompt ??
            "Reply with the single word OK for a connectivity check.",
        },
      ],
    });
    return NextResponse.json({
      model: result.model,
      text: result.text,
      latencyMs: result.latencyMs,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Probe failed.";
    const missingKey = message.includes("MODEL_API_KEY is not set");
    return NextResponse.json(
      {
        error: missingKey
          ? "Model key is not configured on the server."
          : "The model call failed. Try again.",
      },
      { status: missingKey ? 503 : 502 }
    );
  }
}
