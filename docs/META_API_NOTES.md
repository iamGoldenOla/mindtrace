# META_API_NOTES.md: Observed Meta Model API shapes

Recorded from real calls. Nothing here is guessed: entries marked UNVERIFIED
have not been observed yet.

## 2026-10-28: provider built, no real call yet

- Base URL: `https://api.meta.ai/v1` (from docs, UNVERIFIED against a live call).
- Chat request sent by `lib/ai/provider.ts`:
  `POST {base}/chat/completions` with `{ model, messages }` and
  `Authorization: Bearer $MODEL_API_KEY`.
- Chat response parsed as `{ choices[0].message.content }` (UNVERIFIED).
- `.env.local` with a real key was not present in this workspace, so no live
  response has been recorded yet. The first real `POST /api/ai/probe` result
  goes here: status, latency, and the observed JSON shape (never the key).
- ASR (`/asr/transcribe`) and image (`/images/generations`) shapes: UNVERIFIED.

## 2026-10-29: probe route wired, live call still blocked

- `.env.local` does not exist in this workspace, so no live model call was made.
  Nothing was read, printed, or committed regarding any key.
- `POST /api/ai/probe` fail-safe verified by `tests/probe.test.ts`: without a
  key it returns 503 with a plain message and leaks nothing; unknown fields
  return 400. A live dev-server check was impossible (sandbox denies new
  listening sockets), and the real chat response shape stays UNVERIFIED.
- First real call happens after you create `.env.local` with the key; its
  observed status, latency, and JSON shape go here (never the key).

## 2026-10-29: first real call VERIFIED (no key stored here)

Three minimal chat calls were made server-side only (two through the real
`lib/ai/provider.ts chat()` code path, one direct fetch with the identical
request construction to capture the raw envelope). Observed:

- Request: `POST {MODEL_API_BASE_URL}/chat/completions` with headers
  `Authorization: Bearer <key, never logged>` and
  `Content-Type: application/json`, body keys exactly
  `{ "model": "muse-spark-1.3", "messages": [{ "role": "user", "content": "<<=500 chars>" }] }`.
- Response: HTTP 200, `content-type: application/json`.
  Provider-path latencies observed: ~8.2 s and ~9.4 s.
- Exact raw JSON shape (OpenAI-compatible `chat.completion` envelope):
  top-level keys `id`, `choices`, `created`, `model`, `object`, `usage`.
  `choices` is a 1-element array; element keys are `finish_reason`
  (observed `"stop"`), `index` (number), `message`, `logprobs` (null).
  `message` keys are `content` (observed `"OK"` for the connectivity
  prompt), `refusal` (null), `role` (observed `"assistant"`).
  `model` echoes the requested model id; `object` is `"chat.completion"`.
  `usage` keys: `completion_tokens`, `prompt_tokens`, `total_tokens`
  (numbers), `completion_tokens_details: { reasoning_tokens }`,
  `prompt_tokens_details: { cached_tokens }`.
- `lib/ai/provider.ts` parses `choices[0].message.content` and returns
  `{ text, model, latencyMs }`; confirmed working end to end.
- No billing or key error: the key is accepted and credit is available.
  If a future call fails, `provider.ts` surfaces
  `Meta chat call failed with status <n>` (401 = bad key, 402/403 = check
  billing/access, 429/5xx = retried once, then surfaced).
- Route wrapper `POST /api/ai/probe` (dev only) returns
  `{ model, text, latencyMs }` on success; anonymous callers get 401 and
  all callers get 404 in production (see `tests/probe.test.ts`).
  A route-level live check needs a signed-in teacher (Supabase), so the
  live verification above went through the provider layer the route calls.
- ASR (`/asr/transcribe`) and image (`/images/generations`) shapes: still
  UNVERIFIED (no call made yet).

## 2026-10-29: tool calling VERIFIED, ASR endpoint probed

- Tool calling on `muse-spark-1.3` via `POST {base}/chat/completions` with
  `tools` + `tool_choice: "auto"`: VERIFIED. The model returned
  `finish_reason: "tool_calls"` with `message.tool_calls[]`, and answered
  directly when no tool was needed. `tool_choice: "required"` (and named
  choices) is rejected with HTTP 400 (`only "auto" is supported`), so the
  agent loop uses `auto` with a 6-round cap. No BUILD_PLAN fallback needed.
- ASR: `POST {base}/asr/transcribe` with multipart `file` + `model` fields
  EXISTS (it validates input and returns HTTP 400 JSON
  `{sessionId, error{type, message}}` for a synthetic tone clip). The success
  envelope and word-timing fields are still UNVERIFIED: requests with audio
  bodies repeatedly hit the 30-90 s client timeout in this sandbox, so no
  successful transcription was observed here. `lib/ai/transcribe.ts` parses
  `text`/`transcript` (+ nested `data.*`) and optional
  `words`/`segments`/`tokens` arrays, and the UI treats missing timing as
  accuracy-only evidence. One real browser recording will pin the shape;
  if the endpoint stays unreachable, say so and keep manual entry.
- `/audio/transcriptions` hangs from here (client timeout); not used.
