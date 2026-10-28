# ARCHITECTURE.md

## 1. Decisions

| Area | Decision | Why |
|---|---|---|
| Framework | Next.js (App Router) with TypeScript | One codebase for UI and server routes; fast to deploy; strong agent support |
| Styling | Tailwind CSS with design tokens from `DESIGN.md` | Fast, consistent, tokenised |
| Database and auth | Supabase (Postgres, Auth, RLS) | RLS gives enforceable per-learner access with little code |
| AI provider | Meta Model API through an OpenAI-compatible client | Matches the hackathon requirement; one code path for chat, images, transcription |
| Validation | zod schemas shared between client and server | Same contract everywhere |
| Hosting | Vercel (app) and Supabase (data) | Public live URL for judges in minutes |
| Tests | Vitest (unit), Playwright (one end-to-end hero test) | Protects the demo path |
| Package manager | pnpm or npm, lockfile committed | Reproducible |

If the official Meta quickstart contradicts anything here, follow the quickstart and update this file.

## 2. System overview

```
Browser (teacher UI, activity UI)
   |  HTTPS, cookie session
   v
Next.js server (route handlers)
   |-- auth/session check, zod validation, RLS-scoped DB client
   |-- lib/reading   evidence engine (pure code)
   |-- lib/ai        provider layer, agent loop, verifier, scrub
   |        |-- Meta Model API  /chat/completions, /asr/transcribe, /images/generations
   |        '-- (optional) partner inference for Muse Spark Open
   '-- Supabase Postgres (RLS on every table)
```

Principle: **code computes, the model interprets.** Alignment, counts, comparisons and permission checks are deterministic. The model reads structured evidence and proposes explanations and supports. A verifier rejects unsupported claims.

## 3. Meta Model API integration

Base URL `https://api.meta.ai/v1`, header `Authorization: Bearer $MODEL_API_KEY`. The OpenAI SDK does **not** read `MODEL_API_KEY` automatically; pass `apiKey` and `baseURL` explicitly. Endpoints reported in Meta's reference: `POST /chat/completions`, `POST /responses`, `POST /images/generations`, `POST /asr/transcribe`. These details came from the docs and third-party summaries: **verify with a `curl` on Day 0 and record the real request and response shapes in `docs/META_API_NOTES.md`.**

| Model | ID (verify) | Use in MINDTRACE | Priority |
|---|---|---|---|
| Muse Spark 1.3 | `muse-spark-1.3` | Investigator agent, verifier, follow-up task drafting | P0 |
| Muse Voice Transcribe | `muse-voice-transcribe-1.0` | Transcribe read-aloud audio (synchronous) | P0 |
| Muse Image | `muse-image-1.0` | Teacher-approved visual support cards and picture cues | P1 |
| Muse Spark Open | partner-served, e.g. Baseten `meta-models/muse-spark-open-1026` | Privacy mode investigation | P1 stretch |
| Muse Code | CLI | Optional use for building; mention in README if used | optional |
| Muse Wonder, SAM 3.1, Muse Glimmer | | Not planned. Do not add them to say we used them | none |

**Never use** `muse-spark-1.3-contributor` or any `-contributor` model with learner data (data used to improve Meta products). The provider layer rejects it.

### Provider layer (`lib/ai/provider.ts`)

```ts
interface ChatProvider {
  chat(req: ChatRequest): Promise<ChatResponse>;       // tool calling supported
}
interface AsrProvider {
  transcribe(audio: Buffer, opts: { language?: string }): Promise<Transcript>;
}
interface ImageProvider {
  generate(prompt: string, opts: ImageOpts): Promise<ImageResult>;
}
```

- Config: `AI_PROVIDER=meta` or `partner-open`, plus model names from env. Allowlist check on startup and per call.
- Timeouts: chat 30 s, ASR 20 s, image 30 s. One retry with jitter on 429/5xx. Never retry non-idempotent writes.
- Every call logs an `ai_runs` row (no raw content).
- `Transcript` type: `{ text: string; words?: {text,start,end,confidence?}[]; raw: unknown }`. Word timing is optional because the response shape is unverified.

## 4. Modules

| Module | Responsibility |
|---|---|
| `lib/reading/align.ts` | Word-level alignment, error categories (pure) |
| `lib/reading/evidence.ts` | Build evidence records with stable IDs, summary metrics, insufficiency flags |
| `lib/reading/compare.ts` | Matched comparison of two attempts with variation caveats |
| `lib/ai/agent.ts` | Bounded tool-calling loop |
| `lib/ai/tools.ts` | Tool definitions and server-side executors |
| `lib/ai/prompts/` | Versioned system prompts |
| `lib/ai/schema.ts` | zod report schema |
| `lib/ai/verify.ts` | Claim verification and banned-language filter |
| `lib/ai/scrub.ts` | Strip names, contacts, long digit strings from free text before prompts |
| `lib/db/` | Typed Supabase client, query helpers |
| `lib/auth/` | Session helpers, `requireLearnerAccess` |
| `content/` | Support catalogue, concern guides, resources, region packs, i18n strings (JSON/MDX) |

## 5. Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/learners` | GET, POST | List and create (RLS-scoped) |
| `/api/learners/[id]/observations` | GET, POST | Observations |
| `/api/attempts` | POST | Create attempt (`baseline` or `followup`, form, support condition) |
| `/api/attempts/[id]/transcribe` | POST | Receive audio, call ASR, discard audio, store transcript |
| `/api/attempts/[id]/transcript` | PATCH | Teacher correction |
| `/api/attempts/[id]/evidence` | POST | Run evidence engine, store responses |
| `/api/investigations` | POST | Create from concern plus attempts |
| `/api/investigations/[id]/run` | POST | Run agent and verifier; stream progress events |
| `/api/reports/[id]/review` | POST | Teacher approves, edits or rejects |
| `/api/strategies` | POST | Record chosen support |
| `/api/followups/[id]/compare` | POST | Compute and store comparison |
| `/api/images` | POST | Generate a support card (P1) |
| `/api/resources` | GET | Reviewed resources by topic and language |
| `/api/learners/[id]` | DELETE | Full deletion with audit event |

All routes: authenticate, validate with zod, check learner access, rate-limit AI routes, return typed errors.

## 6. Agent loop and report flow

1. Evidence is already stored (deterministic).
2. `run` loads authorised evidence, scrubs free text, starts the agent.
3. The agent calls tools (see `AI_SPEC.md`), then returns a report JSON.
4. Server validates against the zod schema.
5. Verifier pass checks claims against evidence and banned language.
6. If valid: store `ai_reports` with `verification`. If invalid: one repair attempt; if still invalid, store a failed run and show a partial, clearly marked result (evidence and trace remain visible).
7. Progress events stream to the UI: "Reading evidence", "Checking history", "Weighing explanations", "Verifying claims".

## 7. Environment variables

`.env.example` (names only, no values):

```
MODEL_API_KEY=
MODEL_API_BASE_URL=https://api.meta.ai/v1
AI_PROVIDER=meta
AI_MODEL_REASONING=muse-spark-1.3
AI_MODEL_ASR=muse-voice-transcribe-1.0
AI_MODEL_IMAGE=muse-image-1.0
PARTNER_OPEN_BASE_URL=
PARTNER_OPEN_API_KEY=
PARTNER_OPEN_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APP_ORIGIN=
```

The service role key is used only in server-only modules (never imported by client components).

## 8. Observability

- `ai_runs` table for latency, tokens, status.
- Structured server logs without learner content.
- A `/admin/health` page (admin only) shows API reachability and the last five AI runs.

## 9. Deployment

- Vercel project connected to the public repo; Supabase project with migrations applied via CLI.
- Preview deployments for branches. Production URL used in the submission.
- Nightly reset of the demo dataset (scheduled function), because the app is public.
- Smoke test before submission: sign in, run hero path, delete a learner.

## 10. Known unknowns (resolve on Day 0 or 1)

1. Exact ASR request format (multipart or base64), maximum audio length, and whether word timestamps or confidence are returned.
2. Whether `muse-spark-1.3` tool calling works through `/chat/completions` as in the OpenAI spec.
3. Muse Image sizes and style controls.
4. Rate limits on the hackathon credits.
5. Partner endpoint format for Muse Spark Open.
