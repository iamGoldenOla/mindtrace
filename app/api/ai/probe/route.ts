import { NextResponse } from "next/server";
import { z } from "zod";
import { chat } from "@/lib/ai/provider";
import { supabaseAnon } from "@/lib/db/client";

const Body = z
  .object({
    prompt: z.string().max(500).optional(),
  })
  .strict();

// The probe spends model credit, so it is disabled entirely in production
// and requires a signed-in user everywhere else. Anonymous callers learn
// nothing about server configuration from the error responses.
async function isSignedIn(req: Request): Promise<boolean> {
  const header = req.headers.get("authorization");
  const token = header?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) {
    return false;
  }
  try {
    const { data, error } = await supabaseAnon().auth.getUser(token);
    return !error && !!data.user;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  if (!(await isSignedIn(req))) {
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
