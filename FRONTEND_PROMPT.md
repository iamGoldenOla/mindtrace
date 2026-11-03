# FRONTEND_PROMPT.md: MINDTRACE frontend master prompt

Scope: UI only. Do not change anything in lib/, the API routes, the database schema, or the AI prompts. If a screen needs data the API does not return, tell me instead of changing the API.

DESIGN.md governs. Where this file is more specific, this file wins. The no-diagnosis rules in KICKOFF.md and AI_SPEC.md apply to every word on every screen.

## Step 0: Diagnose before you design

The frontend is not loading for me. Before changing any design:
1. Start the dev server and report exactly what `http://localhost:3000` does (blank page, 500, console error, hydration error, port in use). Show me each command first.
2. Check `app/hero-scene.tsx` and the three.js dependency. They previously caused a dev-mode 500. Remove the 3D hero and the three dependency unless it is stable, under 150 KB, and truly adds value. DESIGN.md says the Trace is the memorable element, and many teachers use slow connections and shared laptops. Use the real Trace component as the hero instead.
3. Fix the cause, run `npm run build` and confirm `GET /` returns 200 with no console errors. Commit that fix on its own.
Only then continue with the sections below.

## Business

MINDTRACE: an AI agent for teachers that investigates why a learner struggles to read, suggests a support, and checks whether it worked. It gives educational observations, not diagnoses. Built for the Meta Global AI Developer Hackathon (Indie track, "Build for Your World"). One developer, built in a week, public repository.

## Goal

- Landing page: in under 30 seconds a visitor (a judge, a teacher, a school leader) understands the loop (investigate, support, verify), sees a real Trace, and trusts the guardrails. Primary action: "Try the demo".
- App: let a teacher record a concern, run a supervised read-aloud, see word by word what happened, review an evidence-cited report, choose a support, and compare a matched follow-up, with no dead ends and no broken states.

## Audience

Primary: classroom teachers and tutors on shared laptops, mid-range tablets and slow connections, in many countries. Secondary: hackathon judges watching a 3-minute video and opening the live site, school leaders, specialists. The learner appears only inside the supervised read-aloud screen, with an adult present.

## Feeling

Calm, careful, trustworthy, attentive. A good observation notebook, not a medical device and not a game. The teacher feels capable, never judged. Nothing should feel alarming or label a child.

## Mood

Quiet and spacious. Cool daylight, not warm cream. Precise but human. One memorable element (the Trace); everything else restrained. No stock photos of children, no mascots, no medical icons (stethoscope, brain, puzzle piece).

## Layout

- Landing: single column, content width 720px for text and up to 1040px for the Trace and the before/after block. Left-aligned. Section gaps 64 to 96px. Structure from whitespace and hairline rules, not stacks of identical cards.
- App shell: top bar (product name, active learner, role, sign-out) and, inside a learner, a left rail (260px) with Overview, Observations, Activities, Investigations, Supports, Resources. Main column about 720px.
- Investigation workspace: Trace first, then report, then support plan, all in one column. Evidence chips link to Trace words and highlight both ways.
- Dashboard ("Today"): a plain list of learners needing follow-up with one action per row. No metric tiles.
- Mobile (375px): rail becomes a bottom sheet; the Trace wraps by sentence; every touch target at least 44px; no horizontal scroll except inside tables.
- Read-aloud screen: single column, passage at 32 to 44px, one primary button, pause and repeat, captions for any spoken instruction, no timer, no points.

## Typography

Headings: Literata 600, sentence case. Interface and body: Atkinson Hyperlegible 400 and 600. Passage text: Atkinson Hyperlegible by default, selectable Lexend or system sans (a preference, not a health claim). Scale 14, 16, 18, 22, 28, 36px. Body line-height 1.55, headings 1.2, line length 45 to 70 characters. Load fonts with `next/font` (self-hosted, no layout shift) and list their licences in docs/THIRD_PARTY.md. No all-caps labels, no eyebrow text above headings, no one-word emphasis in headlines.

## Color

Tokens (already in the Tailwind config; do not invent new ones):
- daylight #EEF3F4 page background; paper #FFFFFF reading surfaces; ink #17242E text.
- pine #1F5C57 matched, verified, primary action; marigold #D69A1E pattern worth exploring (fill only, never text); madder #A9443B omissions (sparing); dusk #6B6F9C uncertain or edited; rule #C9D4D8 hairlines; mist #DCE6E8 quiet fills.
- Learner screen: #F5F7F4 with pine as the only accent; optional adult-chosen tints (none, #E8F1F8, #FAF3D9, #E6F3E8), described as preferences only.
- Check contrast for every pair used; never rely on colour alone (each Trace outcome also has a shape or pattern).

## Animation

One orchestrated moment: when evidence first appears, Trace segments settle left to right once, under 700 ms, ease-out. Everything else responds to user actions only (open, expand, confirm), 150 to 200 ms. No looping, parallax, confetti or hover effects on every card. Honour `prefers-reduced-motion` by showing everything instantly. No flashing, no autoplay sound.

## Visual Reference

The Trace: a row of segments, one per target word, wrapping at sentence boundaries. Matched = solid pine bar. Substitution = marigold bar with a notch and the heard word above in small type. Omission = madder bar with a gap and the word lightly struck through. Insertion = small dusk tick between words. Self-correction = small curl above a pine bar. Insufficient or teacher-edited = dashed dusk bar. Each segment is a button: focus or hover shows evidence ID, target, heard, category, and whether the teacher edited it. A "Show as table" toggle gives the same data in an accessible table. The comparison view stacks the before Trace above the after Trace on a shared baseline.

## Sections

Landing page, in order:
1. Hero: headline, one supporting sentence, the live Trace (a labelled synthetic example, see Copy), primary and secondary buttons.
2. Story: a short teacher scene.
3. The loop: Observe, Investigate, Support, Verify (a real sequence, so numbering is appropriate), one sentence each.
4. Proof: before and after Traces with the careful comparison sentence, labelled as a synthetic example.
5. Guardrails: "What MINDTRACE will not do".
6. Built on Meta models: list only the models that are integrated and working at build time (Muse Spark for the investigation agent; Muse Voice Transcribe for read-aloud transcripts once verified). Do not mention a model that is not wired in.
7. Footer: repository link, hackathon name, standing notice, "Development build" note if applicable.

App screens to polish (all states: default, loading, empty, error, disabled): sign-in (with a visible "Development sign-in, not for production" banner when dev auth is active), Today, learners list, learner overview and timeline, observation and concern forms, read-aloud (including ASR failure, empty transcript, manual entry, teacher correction), attempt with Trace and table, investigation workspace with streamed progress ("Reading evidence", "Checking history", "Weighing explanations", "Verifying claims"), report view, support plan, follow-up and comparison, resources, concern guides, about page, 404 and error pages.

## CTA

Landing primary: "Try the demo". Secondary: "See how it works" (scrolls to the loop). App actions use one name each, everywhere: Start reading, Stop and save, Run investigation, Approve report, Save support plan, Assign follow-up, Compare results. No arrows appended to buttons. After "Approve report" the toast says "Report approved".

## Copy Direction

Use SNAP:
- Story: A teacher watches a child hesitate over the same word every day and has nobody to ask why.
- Need: To know what is getting in the way, what to try this week, and whether it worked, without waiting months for a specialist.
- Answer: An agent that investigates with real evidence from a read-aloud, explains competing possibilities, suggests supports, and checks a matched follow-up.
- Proof: A real word-by-word Trace, a careful before and after, and the plain line "MINDTRACE gives educational observations, not diagnoses."

Draft headline: "See why a child stumbles over a word, then check whether your support helped." Supporting line: "MINDTRACE helps teachers investigate a reading difficulty with real evidence, choose a classroom support, and compare a matched follow-up."

Rules: plain verbs, sentence case, active voice, short sentences. Errors say what happened and how to fix it, with no apology or blame. Example: "The recording could not be transcribed. Nothing was saved. Try again, or type what you heard." Empty states invite action ("No readings yet. Start a baseline reading to see the Trace."). Label AI output "Draft for your review" until approved.

Never use: diagnose, symptoms of, at risk, disorder, detect, screening result (as a finding). Use: observed, pattern, worth exploring, possible explanation. Any example shown on the landing page must be labelled "Example from a synthetic learner" and must come from the real evidence engine on seeded synthetic data, not hand-drawn numbers. Standing notice on the landing footer and every report: "MINDTRACE gives educational observations, not diagnoses. If you have concerns about a child's development or health, talk to a qualified professional."

## Quality bar and constraints

- Landing page weight: under 300 KB of JavaScript, fonts via next/font, no autoplay media, Lighthouse accessibility 95 or higher. Do not add heavy animation or 3D libraries.
- WCAG 2.2 AA: keyboard operable, visible focus (2px pine outline with 2px offset), screen-reader names on every Trace segment and form control, 200% zoom without loss, touch targets 44px, reduced motion honoured.
- Do not add placeholder text, lorem ipsum or invented testimonials, logos, statistics or claims. content/team.json is empty: show a clean "Built by" section with a single placeholder I will fill, and do not invent names.
- Do not use medical imagery, photos of children, or stock illustration.
- Before building any screen, write a 5-line plan (tokens used, layout, alignment), check it against DESIGN.md, and revise anything that reads like a generic template. Build mobile first. After each screen remove one decorative element.

## Order of work

1. Step 0 diagnosis and fix, commit.
2. App shell, tokens, fonts, and shared components (button, input, banner, toast, empty state, skeleton, Trace).
3. Landing page.
4. Learners list, learner overview, observation and concern forms.
5. Read-aloud screen and attempt with Trace.
6. Investigation workspace and report view.
7. Support plan, follow-up and comparison.
8. Resources, guides, about, 404 and error pages.
9. Accessibility pass and screenshots at 375px and 1280px (use Playwright if available; otherwise tell me which pages to check by hand).

Commit after each step with a clear message. Do not push. Run type-check, lint, tests and `npm run build` before each commit. Show me each command before it runs. After each step, tell me which URL to open and what I should see.

## Definition of done

Every page loads with no console errors; every page has loading, empty and error states; no banned wording appears anywhere (run a search for the "Never use" words and report counts); the landing page makes the loop clear in 30 seconds; the Trace is the visual centre of the product.
