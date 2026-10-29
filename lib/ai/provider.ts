// Provider layer for Meta Model API. All model calls go through here, server-side only.
// Never import this module from client components.

export const META_API_BASE_URL = "https://api.meta.ai/v1";

const ALLOWLISTED_REASONING = new Set(["muse-spark-1.3"]);
const ALLOWLISTED_ASR = new Set(["muse-voice-transcribe-1.0"]);
const ALLOWLISTED_IMAGE = new Set(["muse-image-1.0"]);

export function assertAllowedModel(model: string): void {
  if (model.endsWith("-contributor")) {
    throw new Error(
      "Rejected model: -contributor variants must never receive learner data."
    );
  }
  if (
    !ALLOWLISTED_REASONING.has(model) &&
    !ALLOWLISTED_ASR.has(model) &&
    !ALLOWLISTED_IMAGE.has(model)
  ) {
    throw new Error(`Rejected model: ${model} is not on the allowlist.`);
  }
}

export interface ToolCall {
  id: string;
  name: string;
  argumentsJson: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  responseFormat?: "text" | "json";
  timeoutMs?: number;
  tools?: unknown[];
  toolChoice?: unknown;
}

export interface ChatResponse {
  text: string;
  model: string;
  latencyMs: number;
  finishReason: string | null;
  toolCalls: ToolCall[];
}

export type Transcript = {
  text: string;
  words?: { text: string; start: number; end: number; confidence?: number }[];
  raw: unknown;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isRetryable(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

export async function chat(req: ChatRequest): Promise<ChatResponse> {
  const baseUrl =
    process.env.MODEL_API_BASE_URL?.replace(/\/$/, "") ?? META_API_BASE_URL;
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey) {
    throw new Error(
      "MODEL_API_KEY is not set. Add it to .env.local (never commit it)."
    );
  }
  const model = req.model ?? process.env.AI_MODEL_REASONING ?? "muse-spark-1.3";
  assertAllowedModel(model);

  const timeoutMs = req.timeoutMs ?? 30_000;
  const started = Date.now();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: req.messages,
            ...(req.tools ? { tools: req.tools, tool_choice: req.toolChoice ?? "auto" } : {}),
          }),
        },
        timeoutMs
      );
      if (!res.ok) {
        if (isRetryable(res.status) && attempt === 0) {
          await sleep(300 + Math.random() * 400);
          continue;
        }
        throw new Error(`Meta chat call failed with status ${res.status}.`);
      }
      const data = (await res.json()) as {
        choices?: {
          finish_reason?: string;
          message?: {
            content?: string;
            tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
          };
        }[];
      };
      const first = data.choices?.[0];
      const text = first?.message?.content ?? "";
      const toolCalls: ToolCall[] = (first?.message?.tool_calls ?? []).map((t) => ({
        id: t.id,
        name: t.function.name,
        argumentsJson: t.function.arguments,
      }));
      return {
        text,
        model,
        latencyMs: Date.now() - started,
        finishReason: first?.finish_reason ?? null,
        toolCalls,
      };
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await sleep(300 + Math.random() * 400);
        continue;
      }
      throw err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Meta chat call failed.");
}
