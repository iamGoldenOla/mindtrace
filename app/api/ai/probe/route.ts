import { NextResponse } from "next/server";
import { z } from "zod";
import { chat } from "@/lib/ai/provider";

const Body = z
  .object({
    prompt: z.string().max(500).optional(),
  })
  .strict();

export async function POST(req: Request) {
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
