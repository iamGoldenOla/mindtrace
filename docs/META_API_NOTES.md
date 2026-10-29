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
