// Real transcription through the Meta Model API. Server-side only.
// Audio is held in memory and never written to disk, storage, or logs.
import { getRepository } from "@/lib/db";
import type { Transcript } from "./provider";

const ASR_TIMEOUT_MS = 20_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Pure parser for the ASR JSON envelope. Tolerant: the exact success
 *  shape is still being pinned down against the live endpoint. */
export function parseTranscriptPayload(data: unknown): { text: string; words?: Transcript["words"]; raw: unknown } {
  if (!data || typeof data !== "object") return { text: "", raw: data };
  const obj = data as Record<string, unknown>;
  const textKeys = ["text", "transcript"];
  let text = "";
  for (const k of textKeys) {
    if (typeof obj[k] === "string") {
      text = obj[k] as string;
      break;
    }
  }
  if (!text && obj.data && typeof obj.data === "object") {
    const inner = obj.data as Record<string, unknown>;
    if (typeof inner.text === "string") text = inner.text;
    if (!text && typeof inner.transcript === "string") text = inner.transcript;
  }
  let words: Transcript["words"];
  const wordKeys = ["words", "segments", "tokens"];
  for (const k of wordKeys) {
    const arr = (obj[k] ?? (obj.data as Record<string, unknown> | undefined)?.[k]) as unknown;
    if (Array.isArray(arr)) {
      const parsed = arr
        .filter((w): w is Record<string, unknown> => !!w && typeof w === "object")
        .map((w) => ({
          text: String(w.text ?? w.word ?? ""),
          start: Number(w.start ?? w.start_time ?? 0),
          end: Number(w.end ?? w.end_time ?? 0),
          confidence: typeof w.confidence === "number" ? w.confidence : undefined,
        }))
        .filter((w) => w.text.length > 0);
      if (parsed.length > 0) {
        words = parsed;
        break;
      }
    }
  }
  return { text, words, raw: data };
}

export async function transcribe(
  audio: Buffer,
  opts: { language?: string; filename?: string; mimeType?: string; investigationId?: string | null }
): Promise<Transcript> {
  const baseUrl = (process.env.MODEL_API_BASE_URL ?? "").replace(/\/$/, "");
  const apiKey = process.env.MODEL_API_KEY;
  if (!apiKey || !baseUrl) {
    throw new Error("Model transcription is not configured on the server.");
  }
  const model = process.env.AI_MODEL_ASR ?? "muse-voice-transcribe-1.0";
  if (model.endsWith("-contributor")) {
    throw new Error("Rejected model: -contributor variants must never receive learner data.");
  }
  const started = Date.now();
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const form = new FormData();
      const blob = new Blob([audio], { type: opts.mimeType ?? "audio/webm" });
      form.append("file", blob, opts.filename ?? "reading.webm");
      form.append("model", model);
      if (opts.language) form.append("language", opts.language);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ASR_TIMEOUT_MS);
      let res: Response;
      try {
        res = await fetch(`${baseUrl}/asr/transcribe`, {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}` },
          body: form,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
      if (!res.ok) {
        if ((res.status === 429 || (res.status >= 500 && res.status <= 599)) && attempt === 0) {
          await sleep(300 + Math.random() * 400);
          continue;
        }
        throw new Error(`Transcription call failed with status ${res.status}.`);
      }
      const data: unknown = await res.json();
      const parsed = parseTranscriptPayload(data);
      await getRepository().logRun({
        investigation_id: opts.investigationId ?? null,
        kind: "asr",
        provider: "meta",
        model,
        prompt_version: null,
        schema_version: null,
        input_hash: null,
        status: "ok",
        error: null,
        latency_ms: Date.now() - started,
        tokens_in: null,
        tokens_out: null,
      });
      return { text: parsed.text, words: parsed.words, raw: data };
    } catch (err) {
      lastError = err;
      if (attempt === 0) {
        await sleep(300 + Math.random() * 400);
        continue;
      }
      await getRepository().logRun({
        investigation_id: opts.investigationId ?? null,
        kind: "asr",
        provider: "meta",
        model,
        prompt_version: null,
        schema_version: null,
        input_hash: null,
        status: "failed",
        error: err instanceof Error ? err.message.slice(0, 200) : "Transcription failed.",
        latency_ms: Date.now() - started,
        tokens_in: null,
        tokens_out: null,
      });
      throw err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Transcription failed.");
}
