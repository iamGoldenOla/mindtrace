# SKILLS.md: Reusable procedures for coding agents

Each skill is a short, repeatable procedure. Before starting a task, find the matching skill, follow it, and report which one you used. If none fits, say so and propose a new skill.

Always read `AGENTS.md` and `SECURITY.md` first (they apply to every skill).

---

## Skill: prompt-clarity (use before writing any frontend prompt or UI brief)

**Trigger:** any request to design or build a screen, page, or component.
**Steps:** think in layers before writing: goal, audience, feeling, sections, mood, typography, call to action. Replace vague words with concrete choices.
- Never write "make it premium", "modern", "clean", or "sleek". Say what that means: the type family and scale, spacing, which colours do what, what moves and what does not.
- Use the Master Prompt Template (`MASTER_PROMPT.md`): Business, Goal, Audience, Feeling, Mood, Layout, Typography, Color, Animation, Visual Reference, Sections, CTA, Copy Direction.
- Use the SNAP framework for any messaging: Story, Need, Answer, Proof.
**Done when:** every field in the template is filled with a concrete, testable statement and conflicts with `DESIGN.md` are resolved in favour of `DESIGN.md`.

---

## Skill: schema-change

**Trigger:** a new table or column.
**Steps:** (1) check `DATABASE.md`; (2) write a migration file; (3) enable RLS and write policies; (4) update zod types and seed; (5) add an RLS test proving another user is denied; (6) update `DATABASE.md`.
**Done when:** migration applies on a clean database, RLS tests pass, no column stores a diagnosis or contact detail.

---

## Skill: add-assessment-form

**Trigger:** a new passage form, item set, or language.
**Steps:** (1) write original text only (no copied material); (2) match length and structure to existing forms; (3) add to `assessment_definitions` with `validation_status = 'unvalidated'`; (4) add alignment tests; (5) document caveats in `ASSESSMENT_SPEC.md`; (6) for a new language, record the writing-system note and native-speaker review status.
**Done when:** the evidence engine tests pass for the new form and the UI shows the unvalidated notice.

---

## Skill: evidence-engine-change

**Trigger:** any change in `lib/reading/`.
**Steps:** write or update tests first; keep functions pure; never call the network; keep evidence IDs stable; update `ASSESSMENT_SPEC.md`.
**Done when:** the property test (counts sum to the target length) passes and a snapshot test of the demo learner is unchanged or the change is explained.

---

## Skill: ai-prompt-change

**Trigger:** editing a system prompt, schema, tool, verifier, or filters.
**Steps:** (1) bump `prompt_version` or `schema_version`; (2) update `AI_SPEC.md`; (3) run the 10-case evaluation set; (4) confirm no condition names, probabilities, or treatment advice appear; (5) confirm injection case 7 passes.
**Done when:** all evaluation cases pass and results are saved under `tests/ai-eval/results/` with the versions.

---

## Skill: meta-api-call

**Trigger:** adding or changing any call to a Meta model.
**Steps:** (1) go through `lib/ai/provider.ts`; (2) check the model against the allowlist (never `-contributor`); (3) set a timeout and one retry; (4) log an `ai_runs` row without content; (5) record the real request and response shape in `docs/META_API_NOTES.md`; (6) handle failure without losing data.
**Done when:** a mocked-failure test proves the attempt data survives.

---

## Skill: ui-screen

**Trigger:** building or revising a screen.
**Steps:** (1) run prompt-clarity; (2) write the short design plan (tokens, layout, alignment) and check it against `DESIGN.md`; (3) build mobile first; (4) implement all states (default, loading, empty, error, disabled); (5) run the accessibility checklist; (6) screenshot at 375px and 1280px and critique; remove one decorative element.
**Done when:** keyboard-only use works, contrast passes, copy follows the rules, and no unsupported diagnostic wording appears.

---

## Skill: accessibility-check

**Steps:** keyboard-only run of the screen; screen-reader names on the Trace and form controls; contrast check of each token pair used; zoom to 200 percent; reduced motion; no colour-only meaning; touch targets 44px.
**Done when:** the list above is ticked in the pull request description.

---

## Skill: security-review

**Steps:** run the checklist in `SECURITY.md` section 4; run the secret scan; run `npm audit`; confirm RLS tests pass; confirm no learner content in logs; confirm the model allowlist test passes.
**Done when:** every box is ticked or has a written exception approved by the maintainer.

---

## Skill: demo-seed

**Steps:** regenerate synthetic learners and attempts from `supabase/seed.sql`; confirm each fixture file carries the "SYNTHETIC DATA" header; confirm no real names; reset the demo dataset; run the hero path once end to end.
**Done when:** the Playwright hero test passes on the freshly seeded database.

---

## Skill: rules-check

**Trigger:** every build day end and before submission.
**Steps:** walk the checklist in `HACKATHON_RULES.md` section 6; confirm commit history shows daily work; confirm no reused code; confirm the README lists Meta models and where they are used; confirm the repository is public.
**Done when:** the checklist is ticked and the organiser answer on the medical-advice question is recorded.

---

## Skill: resource-review

**Steps:** follow `RESOURCES.md`: a human opens the source, confirms publisher credibility and that the content matches the summary, writes the practical action, sets `review_status = 'reviewed'` and the review date. Never let a model produce or guess a URL or video ID.
**Done when:** the resource has all fields and a recorded reviewer.

---

## Skill: demo-recording

**Steps:** follow `DEMO_SCRIPT.md`; use the seeded synthetic learner and an adult voice; run the AI evaluation set first; record at 1080p; keep under 3:00; show only hackathon-built features; add captions.
**Done when:** the video is public, under 3:00, and a stranger can state the investigate, support, verify loop after one viewing.
