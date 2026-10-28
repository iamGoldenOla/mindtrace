# MINDTRACE: Product Requirements Document

**Version:** 0.2 (supersedes 0.1)
**Status:** Implementation baseline for the Meta Global AI Developer Hackathon, Indie track
**Product:** AI-powered learning intelligence and inclusion platform
**Primary users:** Teachers and tutors. **Secondary:** parents, learning-support professionals, school administrators.

## 0. What changed from v0.1

- Entered the **Indie Developer** track: everything is built from scratch during Oct 27 to Nov 4.
- Official rules received. The "medical advice" and "simple education chatbot" anti-projects shape our positioning (see `HACKATHON_RULES.md`).
- Meta tooling confirmed: Muse Spark (agent), Muse Voice Transcribe (read-aloud evidence), Muse Image (visual supports), Muse Spark Open (privacy mode, stretch).
- The hero experience is now a **read-aloud investigation loop**, because it uses several Meta models meaningfully and produces real, countable evidence.
- Stack decisions made (`ARCHITECTURE.md`). Authentication and data access defined (`DATABASE.md`, `SECURITY.md`).
- Scope tiers re-cut so the full vision is preserved but the demo path is protected.

## 1. Summary

When a child struggles, adults usually know that something is wrong but not why, what to try, or whether it worked. MINDTRACE helps a teacher **investigate** the learning barrier with real evidence, **support** the learner with a specific adjustment, and **verify** whether the adjustment helped.

The cycle: **Observe, Investigate, Adapt, Support, Verify.**

MINDTRACE gives educational observations, screening-style *patterns worth exploring*, classroom strategies, resources and referral guidance. It **does not diagnose** and does not give medical advice.

## 2. Problem

A wrong answer or a slow read does not say why. Causes include a prerequisite gap, a decoding difficulty, unfamiliar language or vocabulary, difficulty with the instruction or format, attention or sensory demands, fatigue, anxiety, or a mismatch with the teaching method. Most schools worldwide have no specialist on hand. Teachers need a structured way to gather evidence, try something, and see if it works.

## 3. Product principles and guardrails

1. **Evidence before conclusions.** Every AI claim cites recorded evidence.
2. **Support before labels.** Teachers can act without waiting for a diagnosis.
3. **Many explanations.** Never assume disability or lack of effort. Language and context come first.
4. **Verify.** Recommendations lead to a follow-up task and a comparison.
5. **Teacher in control.** Findings are suggestions for professional judgement.
6. **Global by design.** Language, curriculum and referral pathways are configurable.
7. **Protect children.** Minimal data, synthetic demo data, strict access.
8. **Transparent.** State uncertainty, limits and sources.

### Language boundaries (enforced in code and prompts)

- Allowed: "patterns often explored in reading-support assessments", "worth discussing with a qualified professional", "this is not a diagnosis".
- Not allowed: "has dyslexia/ADHD/autism", "is likely dyslexic", percentages or risk scores for a condition, "symptoms of", treatment or medication advice.
- A condition name may appear **only** in referral guidance and in general educational guides, never as a finding about a specific learner, and only after a sustained pattern across attempts plus teacher observations.

## 4. Goals and non-goals

**Goals (hackathon):** a working, deployed teacher-facing platform where the full loop runs end to end with real AI calls, real data, and verified outcomes; a three-minute demo that holds up live.

**Non-goals:** diagnosing any condition; replacing clinical or specialist assessment; unvalidated risk probabilities; automated placement or grading decisions; chatbots for children; real children's data in the demo; supporting every language at launch.

## 5. Users

- **Teacher or tutor (primary).** Wants to understand repeated struggle, find workable strategies, track progress, and communicate with parents.
- **Parent or caregiver.** Wants plain-language understanding and home activities. Read-limited in v1.
- **Learning-support professional.** Wants an organised evidence record. Read-limited in v1.
- **School administrator.** Manages staff access. **Does not** automatically see learner records.
- **Learner.** Served through supervised activities. No learner login and no chat in v1.

## 6. Scope and priorities

P0 = needed for the demo path. P1 = important, build if the P0 path is stable. P2 = roadmap, shown as designed content or not at all.

| ID | Capability | Priority |
|---|---|---|
| FR-01 | Teacher sign-in, role-based access, learner-level permissions | P0 |
| FR-02 | Learner profiles (pseudonymous), observations | P0 |
| FR-03 | Concern recording, structured plus free text | P0 |
| FR-04 | Read-aloud assessment with Muse Voice Transcribe | P0 |
| FR-05 | Deterministic evidence engine (alignment, error categories, summary) | P0 |
| FR-06 | Agent investigation (Muse Spark, tool calling) with verifier | P0 |
| FR-07 | Investigation report (evidence, patterns, explanations, gaps, supports, referral, limits) | P0 |
| FR-08 | Support plan and follow-up task assignment | P0 |
| FR-09 | Before/after comparison with careful wording | P0 |
| FR-10 | Investigation history and audit trail | P0 |
| FR-11 | Sound Match and Word Builder mini-games (record evidence events) | P0 (at least one), P1 (both) |
| FR-12 | Inclusive education resource library (curated, reviewed, with video links) | P1 (P0 for 4 seeded items) |
| FR-13 | Concern guides: reading, attention and executive function, autism-related support needs, maths, speech and language, hearing and vision access, writing and motor | P1 as content pages linked to reports |
| FR-14 | Muse Image visual support cards (teacher-approved) | P1 |
| FR-15 | Privacy mode: run the investigation on Muse Spark Open via partner inference | P1 |
| FR-16 | Number Sense game and maths evidence engine | P1 |
| FR-17 | Focus and Pattern activity (go/no-go style, framed as task-following observation) | P2 |
| FR-18 | Parent view with approved reports and home activities | P1 (read-only) |
| FR-19 | Language packs: English complete, second language as proof of the i18n layer | P1 |
| FR-20 | Region packs for referral pathways (e.g. UK SENCo, US 504/IEP, Nigeria, generic) | P1 as editable JSON |
| FR-21 | Offline-tolerant activity capture with later sync | P2 |
| FR-22 | School-level aggregate analytics | P2 |

### How the user's wider vision maps

- *"Games that help teachers discover issues"*: purposeful activities (FR-04, FR-11, FR-16, FR-17) that record evidence. They surface **patterns worth exploring**, not conditions.
- *"How to detect ADHD, autism, dyslexia and others"*: delivered as **concern guides** (FR-13) listing observable signs, alternative explanations, things to try now, what to record, and when to seek a qualified professional. Per-learner output stays non-diagnostic.
- *"What a teacher or tutor can do to help"*: the support catalogue and strategy tracking (FR-08).
- *"YouTube videos on inclusive education"*: the resource library (FR-12) with reviewed sources only.
- *"Global market"*: language and region packs, language-aware assessment records, no fixed norms.

## 7. Functional requirements (detail)

### FR-01 Access
Supabase Auth. Roles: teacher, parent, specialist, admin. Access to a learner is granted through `learner_access`. Teachers see only their learners. All access checks are enforced by RLS and re-checked in routes.

### FR-02/03 Learners, observations, concerns
- Learner: `code`, optional pseudonym, stage, preferred language, assessment language, accessibility preferences.
- Observation: category, context, behaviour, frequency, source type (teacher report, parent report, observed, assessment). Source type is always displayed.
- Concern: free text plus optional category. No "suspected condition" field exists.

### FR-04 Read-aloud assessment
The teacher selects a passage form and a support condition (baseline, or a named support). The learner reads aloud with a supervising adult. Audio goes to Muse Voice Transcribe; the transcript returns; audio is discarded. The teacher may correct the transcript (speech recognition on children's voices is imperfect). Corrections are recorded as such.

### FR-05 Evidence engine
Pure code, no LLM. Aligns transcript to the target passage, produces per-word outcomes and counts, error categories, and a stable evidence ID for every observation (see `ASSESSMENT_SPEC.md`). Marks evidence as *insufficient* when the transcript is empty, very short, or corrected heavily.

### FR-06 Agent
Muse Spark runs a bounded tool-calling loop (max 6 steps): read evidence, read history, consult the support catalogue, propose hypotheses, request a follow-up task, then draft the report. A second verifier call checks every claim for evidence support. Details in `AI_SPEC.md`.

### FR-07 Report
Sections: concern summary; evidence observed; skill patterns; screening-style patterns worth exploring; possible explanations; alternative explanations; information still needed; recommended supports; resources; referral guidance; follow-up plan; limitations. Each evidence item cites evidence IDs. The report shows the model, prompt version and verification result. It begins life as "pending teacher review".

### FR-08 Supports and follow-up
Support catalogue (editable JSON) holds strategies such as chunked text, sound-by-sound pointing, reading ruler, pre-teaching vocabulary, listen-then-read, shorter instructions, extra processing time, response in a different format. The teacher selects a strategy, records the reason and start date. The platform assigns a **comparable** follow-up (same skill, matched passage form, support condition applied).

### FR-09 Comparison
Compares baseline and follow-up on matched metrics. Wording: "After [support], [metric] changed from X to Y on a comparable task." It never says the support caused the change and states when the difference is within normal variation or based on a single attempt.

### FR-10 History
Timeline per learner: observations, attempts, reports, strategies, follow-ups. Exportable PDF/print view for an authorised user (P1).

### FR-12 Resource library
Each record: title, publisher, URL, type, language, topics, audience, summary, practical teaching action, review status, review date. Only `reviewed` resources are surfaced in reports. Videos are linked or embedded from the original publisher. **No AI-generated links.** See `RESOURCES.md`.

### FR-13 Concern guides
Ten parts each: concern explored; observable behaviours; context questions; alternative explanations; things to try now; what to record; how to judge whether it helped; when to seek professional assessment; resources; non-diagnostic statement. Content is written by us and reviewed, not model-generated at runtime.

## 8. Core user journeys

**A. Investigate a reading concern (hero).** Sign in, open synthetic learner, record concern, choose Form A baseline, learner reads aloud, transcript and word-level trace appear, run investigation, review the report, pick a support, assign Form B follow-up under that support, read aloud again, see the comparison, record decision (continue, change, review, refer).

**B. Explore a barrier through a concern guide.** Open a guide, record observations in context, see what else to check, get adjustments to try now and when to refer.

**C. Use the resource library from a report.** Open a suggested resource from the original source, read the summary and practical action, record whether it informed the plan.

## 9. Acceptance criteria (hero demo)

A reviewer can, without help:
1. Sign in as a teacher and open a synthetic learner.
2. Record a reading concern.
3. Run a Form A read-aloud, see the transcript, and see the per-word trace.
4. Generate an investigation report that cites evidence IDs and shows uncertainty.
5. See that no diagnosis, probability or treatment advice appears.
6. Select a support and see a matched follow-up created.
7. Run the Form B read-aloud and see the comparison with careful wording.
8. Open a reviewed resource linked from the report.
9. Review the learner timeline.
10. Observe correct behaviour when: the ASR call fails, the transcript is empty, the model returns invalid JSON, the verifier rejects a claim, and a second teacher tries to open the learner (denied).

## 10. Non-functional requirements

- **Security and privacy:** `SECURITY.md` is binding.
- **Accessibility:** WCAG 2.2 AA target; keyboard operable; screen-reader labelled; adjustable text size; reduced motion; plain language; no flashing; sound optional with visible captions for all instructions.
- **Reliability:** assessment data is saved before any AI step; AI failure never loses data; retries are idempotent.
- **Performance:** dashboard interactions under 1 second on a mid-range laptop; AI steps show progress and finish within about 40 seconds; fall back to a partial report with a clear message.
- **Responsiveness:** 375px to desktop. Reading activity works on a tablet.
- **Maintainability:** versioned prompts, schemas and assessment definitions; tests for the evidence engine and report validation.

## 11. Success measures

**Hackathon:** hero path works live and in the video; Meta tools are visibly used in three or more distinct ways; zero diagnostic claims in outputs across the evaluation set; judges understand the loop in under 30 seconds.

**Later, with real use (not claimed now):** time to a concrete support plan; share of investigations with a recorded follow-up; change on comparable tasks; teacher usefulness ratings; fairness across language groups.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Judged as "medical advice" | Positioning, language boundaries, verifier checks for banned claims, organiser question on Day 1 |
| Speech recognition is poor on child voices or accents | Transcript editing, evidence marked insufficient, demo uses clear adult voice acting a learner, no claims about accuracy |
| Muse Voice Transcribe response lacks word timing | Adapter with graceful fallback to accuracy-only evidence; hesitation metrics hidden |
| Model returns unsupported claims | Verifier pass, evidence IDs, fail-closed |
| API access or credits problems | Verify on Day 0; provider layer; cached demo run as a last resort, labelled clearly |
| Scope too large | Cut lines in `BUILD_PLAN.md` protect the P0 path |
| Reuse of old code | Forbidden by `AGENTS.md`; commit history reviewed on Nov 3 |
| Real child data exposed | Synthetic only; RLS; scrubbing; no audio retention |

## 13. Open decisions

1. Organiser answer on the medical-advice policy question (Day 1).
2. Exact response shape of the transcription endpoint (Day 1, first API test).
3. Whether to ship the privacy-mode (open weights) feature or only design it (decide Day 5).
4. Second interface language, if any (decide Day 6).

## 14. Change log

| Version | Change |
|---|---|
| 0.1 | Initial draft (before rules) |
| 0.2 | Indie track, official rules, Meta tooling, read-aloud hero loop, stack decisions, tiered scope |
