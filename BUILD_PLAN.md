# BUILD_PLAN.md

Building period: **Oct 27 to Nov 4**. Eight build days (Oct 27 to Nov 3) plus a buffer day (Nov 4). Submission is due Nov 4, 9:00 PM ET, which is **3:00 AM WAT on Nov 5**. Our target: **submitted by Nov 3, 9:00 PM Lagos time.**

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
