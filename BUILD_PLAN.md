# BUILD_PLAN.md

Building period: **Oct 27 to Nov 4**. Eight build days (Oct 27 to Nov 3) plus a buffer day (Nov 4). Submission is due Nov 4, 9:00 PM ET, which is **3:00 AM WAT on Nov 5**. Our target: **submitted by Nov 3, 9:00 PM Lagos time.**

## Status (Nov 3, live database backend)

Supabase backend landed so sign-in persists on the deployment: new
`lib/db/supabase-repository.ts` implements the full `Repository` interface
over Postgres; `getRepository()` picks it when `NEXT_PUBLIC_SUPABASE_URL`
and `SUPABASE_SERVICE_ROLE_KEY` are set, else the local JSON store. Schema
delta in `supabase/migrations/0002_dev_sessions.sql` (`profiles.email`,
`dev_sessions` table, RLS enabled with no anon policies); `DATABASE.md`,
`supabase/seed.sql` (emails plus `sentences` the read page needs) and
`supabase/setup-live.sql` regenerated from the two sources. Seed route
resolves teacher ids from Auth on the live backend (profiles.id references
auth.users). Gates: tsc clean, lint clean, Vitest 67 passed / 5 live-only
skips, `next build` all routes. Live proof still pending on the user's
machine: create project, run setup-live.sql, create 2 auth users, set
Vercel env vars, redeploy, then Seed + sign in on the live URL and run the
live suites (`SUPABASE_TEST_URL`, `SUPABASE_TEST_ANON_KEY`,
`SUPABASE_TEST_TOKEN_A/B`, `SUPABASE_TEST_SERVICE_KEY`).

## Status (Nov 3, sign-out that works on live)

Sign-out used its own hard production block, ignoring ALLOW_DEV_AUTH, so on
the deployment it 404d without clearing the session cookie: the user stayed
signed in and Home never returned to the landing. The route now uses
devAuthEnabled() like sign-in/seed, the button lands on Home (/) and reports
a real failure instead of silently navigating. Regression tests pin the live
case (production + flag = 200 with session and cookie cleared) and the locked
case (production without flag = 404). Gates: tsc clean, lint clean, Vitest
72 passed / 5 live-only skips, `next build` all routes.

## Status (Nov 3, self-reporting seed)

Seed flow now diagnoses itself: `GET /api/dev/seed` reports
`{backend, seeded, teachers, learners}` (404 dev-auth off, 500 store
unreachable); the home-page seed button shows that state live ("not set
up yet" vs "ready, now sign in") and surfaces the server's real error
text instead of masking every failure. Gates: tsc clean, lint clean,
Vitest 70 passed / 5 live-only skips, `next build` all routes. Live
proof still on the user's machine: Vercel env (4 vars, Production) +
redeploy, then read the live status line before seeding.

## Status (Nov 3, landing review fixes)

Uncommitted: shared 1120px/24px page container for top bar, banner and
content; running text capped near 65ch; hero/Trace/comparison keep full
container width; About loop/guardrails two-column on desktop, one on
mobile. Hero Trace hides evidence IDs until hover/focus/selection (table
view still lists them); legend kept visible. "How it works" uses one
list-marker numbering; duplicate landing footer notice removed (layout
footer is the single source). Banner reads "Demo mode: synthetic data
only, not for real learners." Before/after captions now come from
align() on the exact drawn transcripts in lib/landing-demo.ts (no
hand-typed counts); skipped words stay drawn struck-through and counted.
Gates: tsc clean, lint clean, Vitest 62 passed / 3 live-only skips,
`next build` 19/19 routes. No API or AI code touched. Not pushed.

## Status (Oct 30, Day 4)

Verified in-repo: `tsc --noEmit` clean, `next lint` clean, `next build`
compiles all routes, Vitest 60 passed / 5 skipped (skips are live-only:
RLS needs a Supabase project, probe success path needs a signed-in
browser session). Implemented so far: Next.js scaffold, provider layer
with model allowlist, local JSON store with migrations plus seed file,
dev auth with learner-access checks, `lib/reading` engine with tests,
support catalogue and guides JSON, read-aloud flow with Trace, agent
loop with verifier and streamed progress, report review, strategies,
matched follow-ups with comparison, resources and guides pages, and the
landing page (SNAP + animated Trace proof + before/after illustration).

Still pending live proof: dev-server hero walkthrough on localhost:3008
(sandbox blocks listening sockets, so run it locally), Supabase project
with RLS tests unskipped, and the 10-case AI eval set against real
model calls. Checklists below are only ticked when their "Done when"
was observed live.

Oct 30 pm: landing dressed (hero 3D trace-field via three 0.186.0,
sections, /about with team slots, Home/About nav). Gates green:
type-check, lint, tests 64 passed / 5 live-only skips, `next build`
passes with the new routes. Team names, roles, and portrait files still needed
from the user (content/team.json is data-driven and empty).

Oct 30 pm (homepage 500 fix): dev-mode chunk failure on `/` traced to the
three.js import in the server chunk graph. Fix: HeroScene loads with
ssr:false, `transpilePackages: ["three"]` in next.config.mjs, new
app/global-error.tsx root boundary. Gates green (type-check, lint,
64 passed / 5 live-only skips). Production build re-run deliberately
skipped while the dev server is up (it shares .next and re-corrupts dev).
Needs: clean GET / 200 in the user's browser.

Nov 2 (RLS suite): tests/rls.test.ts now holds real live assertions
(cross-teacher read isolation on L-0001 plus observations, unauthorized
insert rejected with 42501 and nothing persisted). Still gated on
SUPABASE_TEST_URL / ANON_KEY / TOKEN_A / TOKEN_B, so it skips without a
live project. Gates green: tsc clean, full Vitest 64 passed / 3 skipped.
Sandbox has no outbound network, so reachability, migration-apply, and the
live RLS run must happen on the user's machine (steps in chat).
All copy-paste SQL consolidated in supabase/setup-live.sql (schema + seed
with <TEACHER_A/B_UUID> tokens + verification + viewer/revoke statements).

Nov 2 (Step 0 frontend fix, uncommitted): removed the three.js 3D hero
(663 KB module, failed the 150 KB bar, caused the earlier dev 500).
Landing hero is now the real Trace fed by align() on Form A (27 of 31
counted by code). Deleted app/hero-scene.tsx, lib/hero-bars.ts,
tests/hero-bars.test.ts; uninstalled three/@types/three. Gates green:
tsc, lint, Vitest 60 passed / 3 skipped, build 19/19 routes.
Commit blocked in sandbox (git ownership); user commits locally.

## Revised schedule (Oct 28, Day 2)

Day 1 was missed. Today covers Day 1 + Day 2 together: docs commit, Next.js scaffold, provider layer with one real Muse Spark call, Supabase migrations with RLS and synthetic seed, auth with `requireLearnerAccess` and the RLS isolation test, then `lib/reading` (align, evidence, compare) with tests if time remains. Decisions: privacy mode is design-only, no second language, ASR without word timing uses accuracy and category counts only, tool-calling fallback decided only after a real test. Organiser answers pending.

Each day ends with: tests green, deployed, `rules-check` skill run, and this checklist updated.

## Day 0 (Mon Oct 26, today): no application code

- [ ] Claim Meta Model API credits (card on file; set a spend alert).
- [ ] Join the Discord; post in `#intros`; ask the medical-advice policy question in `#questions`.
- [ ] Request Baseten and Modal credits if using open weights.
- [ ] Test the API with `curl`: one chat call, one tool-calling call, one transcription call with a short audio clip, one image call. Save the **real** request and response shapes in notes (to be committed as `docs/META_API_NOTES.md` on Day 1).
- [ ] Record a clear 20-second adult audio clip reading Form A for later tests.
- [ ] Review the four candidate resources by hand; find 6 more (see `RESOURCES.md`).
- [ ] Put these `.md` files in a private folder, ready to commit on Day 1.

## Day 1 (Tue Oct 27): foundation

- [ ] Create the public repo; first commit contains the docs and the date, then scaffold the Next.js app.
- [ ] Supabase project, migrations from `DATABASE.md`, RLS enabled, seed learners (synthetic).
- [ ] Auth (sign in and out), role display, `requireLearnerAccess`.
- [ ] Provider layer with allowlist; one real chat call from a server route; `ai_runs` logging.
- [ ] CI: lint, type-check, tests, secret scan. Deploy a hello-world to Vercel.
- [ ] Attend Agents 101 (12:00 PM ET) if possible.

**Done when:** a signed-in teacher sees only their own synthetic learners, and a server route returns a real Muse Spark response.

## Day 2 (Wed Oct 28): learners, observations, evidence engine

- [ ] Learner list and profile, observation form, concern form.
- [ ] `lib/reading/align.ts`, `evidence.ts`, `compare.ts` with tests (properties and cases).
- [ ] Support catalogue JSON (8 to 10 supports with "how to try" and "how to evaluate").
- [ ] Attend Agents 102 on verifiable agents (12:00 PM ET).

**Done when:** feeding a transcript produces correct per-word outcomes and metrics in tests.

## Day 3 (Thu Oct 29): read-aloud and the Trace

- [ ] Recording UI (MediaRecorder), `/transcribe` route using Muse Voice Transcribe, audio discarded.
- [ ] Transcript review and correction.
- [ ] The Trace component with segments, hover and focus detail, table view.
- [ ] Failure paths: ASR failure, empty transcript, manual transcript entry.
- [ ] **Schema freeze** (after this day, ask before changing it).

**Done when:** an adult can read Form A aloud and see an accurate Trace, and failure paths preserve the attempt.

## Day 4 (Fri Oct 30): the agent

- [ ] Tools, agent loop, report schema, prompts `investigator.v1` and `verifier.v1`.
- [ ] Deterministic filters, repair attempt, fail-closed behaviour.
- [ ] Progress streaming ("Reading evidence", "Checking history", ...).
- [ ] Report view with evidence chips linked to the Trace.
- [ ] Evaluation set cases 1 to 10 running in the test suite.
- [ ] Attend the Fireworks session (12:00 PM ET) if time allows.

**Done when:** the hero learner's report cites real evidence IDs, passes verification, and the injection test passes.

## Day 5 (Sat Oct 31): supports, follow-up, comparison

- [ ] Support selection and strategy records, review and approve flow.
- [ ] Matched follow-up creation (Form B or C) with the support condition.
- [ ] Comparison screen with careful wording and caveats.
- [ ] Decision control (continue, change, review, refer) and the learner timeline.
- [ ] Decide: ship privacy mode (open weights) or design only.

**Done when:** the whole hero loop runs end to end on seeded data.

## Day 6 (Sun Nov 1): breadth

Pick in this order, stop when time runs out:

1. [ ] Resource library with reviewed items and links from reports (P0 for four items).
2. [ ] Concern guides content (at least reading, attention and executive function, autism-related support needs).
3. [ ] Sound Match activity.
4. [ ] Muse Image visual support cards.
5. [ ] Privacy mode with Muse Spark Open via partner.
6. [ ] Word Builder or Number Sense Quest.
7. [ ] Second interface language (proof of i18n).
8. [ ] Parent read-only view.

Re-read the official guide today for rule changes.

## Day 7 (Mon Nov 2): hardening

- [ ] Full Playwright hero test; failure-path tests; RLS tests; evaluation set.
- [ ] Accessibility pass: keyboard-only, screen reader, 200 percent zoom, contrast.
- [ ] Security pass using the `security-review` skill.
- [ ] Landing page using SNAP; README with Meta tools table and what was built during the event.
- [ ] Seed reset job; clean-browser and phone test of the live URL.

## Day 8 (Tue Nov 3): demo and submit

- [ ] Freeze features at midday Lagos time.
- [ ] Run the evaluation set; reset the demo data; record the video using `DEMO_SCRIPT.md`.
- [ ] Verify repository public, video public, live URL working in a logged-out browser.
- [ ] Post the demo on X; collect the link.
- [ ] **Submit by 9:00 PM Lagos time.**

## Day 9 (Wed Nov 4): buffer

Only fixes. Verify the submission page, contributor list, and links. The platform closes at 9:00 PM ET (3:00 AM WAT, Nov 5). Do not make large changes.

## Cut lines (what we drop first if behind)

Drop in this order: second language, parent view, Number Sense, Word Builder, privacy mode, Muse Image, concern guides beyond three, Sound Match. **Never drop:** read-aloud, evidence engine, agent plus verifier, report, support plan, follow-up, comparison, RLS, the non-diagnostic wording, the demo video.

## Risk watch

| If this happens | Do this |
|---|---|
| ASR returns no word timing | Hide rate metrics; use accuracy and category counts only |
| Tool calling is unreliable on Muse Spark | Fall back to a single structured call with the evidence pre-assembled by code; keep the verifier |
| API rate limits | Cache evaluation runs; serialise calls; ask in `#office-hours` (10 to 11 AM ET) |
| Verifier fails often | Tighten the Investigator prompt and filters; reduce report length limits |
| Behind schedule at end of Day 5 | Freeze scope to the P0 path and use the cut lines |
