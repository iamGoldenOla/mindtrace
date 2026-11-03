# MINDTRACE

**An AI agent that investigates why a learner is struggling, tries a support, and checks whether it worked.**

Built for the Meta Global AI Developer Hackathon, Indie Developer track, "Build for Your World" problem statement.
Building period: Oct 27 to Nov 4, 2026. Submission due Nov 4, 9:00 PM ET.

> MINDTRACE is an educational learning-support tool. It does not diagnose, treat, or give medical advice.

## How this repository is documented

These files are the project's source of truth. A coding agent must read **all** of them before writing code (see `AGENTS.md`).

| File | Purpose |
|---|---|
| `AGENTS.md` | Operating rules for any coding agent. Read first. |
| `SECURITY.md` | Security, privacy and child-safeguarding rules. Mandatory reading. |
| `HACKATHON_RULES.md` | Official rules, judging rubric, and the compliance checklist. |
| `PRD.md` | Product requirements (v0.2), scope, priorities, acceptance criteria. |
| `ARCHITECTURE.md` | Stack, components, data flow, Meta API integration, environment. |
| `DATABASE.md` | Postgres schema, row-level security, seed data. |
| `AI_SPEC.md` | The agent loop, tools, prompts, report schema, guardrails, evaluation. |
| `ASSESSMENT_SPEC.md` | The reading assessment and games: items, scoring, evidence events. |
| `DESIGN.md` | Visual and interaction design system for teacher and learner interfaces. |
| `SKILLS.md` | Reusable procedures an agent follows for recurring tasks. |
| `RESOURCES.md` | Curation rules and candidate list for the inclusive education library. |
| `BUILD_PLAN.md` | Day-by-day plan for Oct 27 to Nov 4 with cut lines. |
| `DEMO_SCRIPT.md` | The three-minute demo video, second by second. |
| `MASTER_PROMPT.md` | Prompts to start the build and the frontend, in the Master Prompt Template. |

## Suggested repository layout

```
/                      README.md, AGENTS.md, SECURITY.md, .env.example
/docs                  every other .md file in this set
/app                   Next.js app (routes, pages)
/lib                   ai/, reading/, db/, auth/ modules
/supabase              migrations and seed
/tests                 unit, integration, ai-eval
```

## What was built during the hackathon

Everything in this repository's application code was written between Oct 27 and Nov 4, 2026. Planning documents (this set) were written before the event and are labelled as such in the commit history. No code, data, or assets from earlier projects are used.

## Who built this

MINDTRACE was built solely by Akinola Olujobi, an educator and developer in Lagos, Nigeria, during the Meta Global AI Developer Hackathon (Oct 27 to Nov 3, 2026), using Muse Code as the coding assistant. The product design, specifications and decisions are the developer's own.

Planning documents written before the event were drafted with AI assistance and are labelled as planning in the commit history. All application code was written during the event.

## Status

See `BUILD_PLAN.md`. Update the checklist at the end of each build day.
