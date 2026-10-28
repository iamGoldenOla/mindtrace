# MASTER_PROMPT.md

Prompts to paste into your coding agent (Muse Code, Antigravity, or any other). Paste Prompt 1 first on Day 1. Use the others when their day arrives. Edit only the bracketed parts.

---

## Prompt 1: Kickoff (Day 1)

```
You are the lead engineer on MINDTRACE for the Meta Global AI Developer Hackathon (Indie track). This repository is public and all application code must be written from scratch between Oct 27 and Nov 4, 2026. Do not import or adapt code, data or assets from any earlier project.

STEP 0, BEFORE ANY CODE
Read every .md file in this repository: SECURITY.md, HACKATHON_RULES.md, PRD.md, ARCHITECTURE.md, DATABASE.md, AI_SPEC.md, ASSESSMENT_SPEC.md, DESIGN.md, SKILLS.md, RESOURCES.md, BUILD_PLAN.md, DEMO_SCRIPT.md, AGENTS.md. Then reply with:
(a) a five-line summary of the product and its hard rules,
(b) the list of requirements you will build today (by PRD ID),
(c) anything unclear or unverified, especially Meta API request and response shapes.
Wait for my confirmation before writing code.

WHAT WE ARE BUILDING
MINDTRACE: an AI agent that helps a teacher investigate why a learner struggles to read, choose a support, and verify whether it worked. The hero loop is: record concern, learner reads aloud, Muse Voice Transcribe returns a transcript, deterministic code builds a word-by-word evidence Trace, Muse Spark (tool-calling agent) plus a verifier produces an evidence-cited report, the teacher selects a support, a matched follow-up is read aloud, and the comparison is shown with careful wording.

HARD RULES
- Educational observations only. Never state or imply that a learner has any condition. No probabilities, risk scores, or treatment or medication advice. Condition names appear only in referral guidance and general guides.
- Code computes, the model interprets. Alignment, counts, comparisons and permissions are deterministic.
- Meta models only, through lib/ai/provider.ts, server-side only. Use muse-spark-1.3; never any -contributor model with learner data.
- Synthetic data only. No audio retention. RLS on every table.
- Work in vertical slices, small commits, tests before commit, fail-safe paths first.

TODAY (DAY 1), BUILD
1. Scaffold Next.js (App Router, TypeScript, Tailwind), lint, type-check, Vitest, CI with a secret scan.
2. Supabase migrations from DATABASE.md with RLS and seed data (two teachers, four synthetic learners).
3. Sign-in, sign-out, role display, and requireLearnerAccess.
4. lib/ai/provider.ts with the model allowlist, timeouts, one retry, and ai_runs logging; one real server route that returns a Muse Spark reply.
5. Deploy to Vercel. Write docs/META_API_NOTES.md with the real request and response shapes you observe.

DEFINITION OF DONE
A signed-in teacher sees only their own synthetic learners; a second teacher cannot open them (tested); a server route returns a real Muse Spark response; CI is green; the deployment URL works. Update the BUILD_PLAN.md checklist and summarise what changed, what was tested, and what is still open.
```

---

## Prompt 2: Frontend design brief (Master Prompt Template)

Use with the `ui-screen` and `prompt-clarity` skills. This applies the layered thinking (goal, audience, feeling, sections, mood, typography, CTA) and fills every field concretely.

```
Business
MINDTRACE: an AI agent for teachers that investigates why a learner struggles to read, suggests a support, and checks whether it worked. It gives educational observations, not diagnoses. Built for the Meta Global AI Developer Hackathon (Indie track); used worldwide by teachers with little or no specialist access.

Goal
Teacher interface: let a teacher record a concern, run a supervised read-aloud, see exactly what happened word by word, review an evidence-cited report, choose a support, and compare a matched follow-up. Landing page: in under 30 seconds, make a visitor understand the investigate, support, verify loop and see a real Trace.

Audience
Primary: classroom teachers and tutors, often on shared laptops and mid-range tablets, sometimes on slow connections, in many countries and languages. Secondary: parents (read-only), learning-support professionals. The learner appears only in a supervised activity screen.

Feeling
Calm, careful, trustworthy, attentive. Like a good observation notebook. Never clinical, never gamified, never alarming. A teacher should feel capable, not judged, and should never feel that a child is being labelled.

Mood
Quiet and spacious. Cool daylight, not warm cream. Precise but human. One memorable element (the Trace); everything else restrained.

Layout
Teacher workspace: left evidence rail (260px) and one working column of about 720px with, in order, Trace, report, support plan. Left-aligned text. Structure from whitespace and hairline rules, not stacks of identical cards. Dashboard is a plain action list, not metric tiles. Mobile: rail becomes a bottom sheet; the Trace scrolls by sentence. Learner activity: single column, large text, one primary button, pause and repeat, captions, no timers.

Typography
Headings: Literata 600, sentence case. Interface and body: Atkinson Hyperlegible 400 and 600. Learner passage: Atkinson Hyperlegible by default, selectable Lexend or system sans (a preference, not a claim). Scale 14, 16, 18, 22, 28, 36; passage 32 to 44. Body line-height 1.55; line length 45 to 70 characters. No all-caps labels, no eyebrow text above headings, no one-word emphasis in headlines.

Color
daylight #EEF3F4 (page), paper #FFFFFF (reading surfaces), ink #17242E (text), pine #1F5C57 (matched, verified, primary action), marigold #D69A1E (pattern worth exploring; fill only, text over it in ink), madder #A9443B (omissions, used sparingly), dusk #6B6F9C (uncertain or edited), rule #C9D4D8, mist #DCE6E8. Learner screen: #F5F7F4 with pine as the only accent; optional reading tints chosen by the adult. Never rely on colour alone: every Trace outcome also has a shape or pattern.

Animation
One orchestrated moment: when evidence first appears, Trace segments settle left to right once, under 700 ms. Everything else responds to user actions only (opening, expanding, confirming). No looping, parallax, confetti, or hover effects on every card. Respect prefers-reduced-motion by showing everything instantly.

Visual Reference
The Trace ribbon: one segment per word, outcome shown by bar style (solid for matched, notched for substitution, gapped for omission, small tick for insertion, dashed for uncertain). Evidence chips in the report link to Trace words and highlight both ways. Comparison view stacks the before Trace above the after Trace on a shared baseline. Do not use medical iconography, brains, puzzle pieces, mascots, or stock photos of children.

Sections
Landing: (1) hero with a live, real Trace and one sentence; (2) the problem as a short teacher story; (3) the loop in five steps (a real sequence, so numbering is appropriate); (4) a before and after comparison; (5) guardrails and honest limits; (6) a short statement of the Meta models used; (7) footer with repository and notice.
App: Today, Learners, Learner overview, Observations, Activities, Investigation workspace, Support plan, Comparison, Resources, Concern guides, Settings.

CTA
Landing: "Try the demo". App actions use one name throughout: Start reading, Stop and save, Run investigation, Approve report, Save support plan, Assign follow-up, Compare results. No arrows appended to buttons.

Copy Direction
Use SNAP: Story (a teacher watches a child hesitate over a word and doesn't know why), Need (to know what is getting in the way, what to try, and whether it worked), Answer (an agent that investigates with real evidence, then verifies the outcome), Proof (a real Trace, a careful before and after, and the plain line "MINDTRACE gives educational observations, not diagnoses"). Plain verbs, sentence case, active voice, no filler. Errors explain what happened and how to fix it, without apology or blame. Empty states invite action. Never use: diagnose, symptoms of, at risk, disorder, detect. Use: observed, pattern, worth exploring, possible explanation. Label AI output "Draft for your review" until approved.
```

---

## Prompt 3: The agent and verifier (Day 4)

```
Read AI_SPEC.md, ASSESSMENT_SPEC.md and SECURITY.md again. Build the investigation agent.

1. lib/ai/schema.ts: the report.v1 zod schema exactly as specified.
2. lib/ai/tools.ts: the six tools, each server-executed, scoped to the single authorised investigation, with ID checks in server code.
3. lib/ai/agent.ts: a bounded loop (max 6 rounds, 40 seconds), then one JSON-only final answer. One repair attempt for invalid JSON.
4. lib/ai/prompts/investigator.v1 and verifier.v1: use the prompts in AI_SPEC.md verbatim as the starting point.
5. lib/ai/verify.ts: deterministic filters (condition names outside allowed fields, probability phrases, treatment words, stigmatising terms) plus the verifier call. Fail closed.
6. POST /api/investigations/[id]/run streaming progress events: Reading evidence, Checking history, Weighing explanations, Verifying claims.
7. Save ai_runs without raw content. Save ai_reports with verification results and review_status pending_teacher_review.
8. Implement evaluation cases 1 to 10 as automated tests under tests/ai-eval with fixtures marked SYNTHETIC DATA.

Do not let the model compute metrics. Do not let tools write to the database. Show me the evaluation results before you move on. If tool calling is unreliable on the Muse Spark endpoint, tell me and propose the fallback in BUILD_PLAN.md instead of improvising.
```

---

## Prompt 4: Daily close-out (every day)

```
Run the rules-check, security-review and accessibility-check skills on today's work. List: what was built (by PRD ID), what was tested, anything that could look like reused code, any diagnostic wording that slipped in, and what is at risk for tomorrow. Update BUILD_PLAN.md. Do not start new features until this is done.
```

---

## Prompt 5: Wording audit (any time)

```
Search the whole repository (code, prompts, fixtures, UI strings, tests, README) for: diagnose, diagnosis, symptom, risk, likely has, disorder, dyslexic, autistic, ADHD, percent chance, medication, therapy. For each hit, say whether it is allowed under AI_SPEC.md section 6, and fix any that are not. Report counts before and after.
```
