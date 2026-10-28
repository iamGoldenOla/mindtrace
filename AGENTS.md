# AGENTS.md: Operating rules for coding agents

This file applies to every coding agent working on MINDTRACE (Muse Code, Antigravity, or any other). If your tool expects a different filename, copy this file to that name; do not fork the content.

## 0. Before you write any code

1. Read **every** `.md` file in this repository, in this order: `SECURITY.md`, `HACKATHON_RULES.md`, `PRD.md`, `ARCHITECTURE.md`, `DATABASE.md`, `AI_SPEC.md`, `ASSESSMENT_SPEC.md`, `DESIGN.md`, `SKILLS.md`, `RESOURCES.md`, `BUILD_PLAN.md`, `DEMO_SCRIPT.md`.
2. State in one short paragraph which requirements apply to the task. If two files conflict, `SECURITY.md` wins, then `HACKATHON_RULES.md`, then `PRD.md`.
3. If a requirement is unclear or unverified, say so and ask. Do not guess API shapes, model names, or credentials.

## 1. Non-negotiable rules

1. **New work only.** This is the Indie track. All application code is written from scratch during Oct 27 to Nov 4, 2026. Never import, copy, or adapt code, data, or assets from any earlier project. Third-party open-source libraries are fine; list them in `docs/THIRD_PARTY.md`.
2. **Public repository.** Assume every file, commit and issue is public. Never commit secrets, real learner data, audio, or personal information.
3. **No diagnosis.** No code path, prompt, UI string, or test fixture may state or imply that a learner "has" or "is" ADHD, autistic, dyslexic, or any other condition. See `AI_SPEC.md` section 6 and `PRD.md` section 3.
4. **No medical advice.** MINDTRACE gives educational support suggestions and referral guidance only.
5. **Meta models only for AI features.** All model calls go through the provider layer in `lib/ai/`. Never call a model from client code. Never use a `-contributor` model variant with learner data.
6. **Evidence before claims.** Every AI claim must cite evidence IDs that exist in the supplied data. Reports that fail verification are not shown as successful.
7. **Server-side secrets.** Model keys and Supabase service keys exist only in server environment variables.
8. **Row-level security on every table.** A table without RLS does not ship.
9. **Synthetic data only** in seeds, tests, screenshots, and the demo.

## 2. How to work

- Work in **vertical slices**: UI, API route, database, and AI path for one capability, finished and tested, before starting the next.
- Commit small and often with clear messages (`feat:`, `fix:`, `docs:`, `test:`). The commit history is evidence of what was built during the hackathon.
- Run type-check, lint and tests before every commit. Do not leave failing tests.
- Prefer boring, well-known libraries. Add a dependency only when it removes real work. Pin versions.
- Keep business rules (scoring, alignment, comparison) in `lib/` as pure, tested functions. The LLM interprets evidence; it never computes scores.
- Handle failure paths first: AI timeout, ASR failure, empty transcript, malformed model JSON, lost connection. Preserve assessment data whenever a downstream step fails.
- Every user-facing string comes from the copy rules in `DESIGN.md`. No placeholder lorem ipsum.
- Accessibility is part of "done": keyboard use, visible focus, contrast, reduced motion, screen-reader labels.

## 3. Definition of done (per feature)

- Purpose is clear and traces to a `PRD.md` requirement ID.
- The user can complete the action end to end in the browser.
- Data persists and RLS blocks an unauthorised user (test it).
- Error and empty states exist and use plain language.
- Works at 375px width and on desktop.
- No unsupported diagnostic claim anywhere in output.
- Unit tests for pure logic; at least one integration test for the route.
- `BUILD_PLAN.md` checklist updated.

## 4. Things to stop and ask about

- Anything involving real children's data, audio or images.
- Adding a new Meta model or a non-Meta AI provider.
- Changing the database schema after Day 3.
- Anything that would take more than half a day and is not on the plan.
- Any rule in `HACKATHON_RULES.md` you are unsure about.

## 5. Communication style for agent summaries

Short and concrete: what changed, what was tested, what is still open. List any assumption you made. Flag risks before you hit them.
