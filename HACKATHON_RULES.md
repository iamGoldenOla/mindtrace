# HACKATHON_RULES.md

Source: Meta Global AI Developer Hackathon Participant Guide (Cerebral Valley). Summarised from the guide supplied by the organisers. **When this summary and the official guide differ, the official guide wins.** Re-read the guide on Nov 1 and Nov 3.

## 1. Facts

| Item | Rule |
|---|---|
| Track | **Indie Developer** (decided) |
| Problem statement | **Build for Your World**: bring Meta's models into a domain you know firsthand |
| Building period | Oct 27 to Nov 4, 2026 |
| Submission | Nov 4, **9:00 PM ET** via the Cerebral Valley platform. Late submissions are not considered |
| Lagos time | 9:00 PM ET on Nov 4 is **3:00 AM WAT on Nov 5** (US clocks go back on Nov 1). Our internal deadline is **Nov 3, 9:00 PM Lagos time** |
| Judging | Nov 5 to Nov 8. Closing ceremony Mon Nov 9, 12:00 PM ET. Community vote winner Nov 16 |
| Team | Max 4 people. Solo allowed |
| Repository | **Must be public** |
| Demo video | **3 minutes**, showing only what was built during the hackathon. It is a primary judging artifact |
| New work | Everything presented must be built during the event. Only Startups may build on existing products or codebases |
| Meta models required | The project must incorporate Meta's models |

## 2. Meta tooling available

Via Meta Model API (base URL `https://api.meta.ai/v1`, Bearer key; verify in the docs): Muse Spark series, Muse Wonder, Muse Image, Muse Voice Transcribe, SAM 3.1.
Open weights: Muse Glimmer, Muse Spark Open (eligible for the open-weights bonus when served on own hardware or partner inference).
Coding agent: Muse Code.
Credits: **$150** Meta Model API credits. Claim through the form; a credit card is required; claim by Nov 4, 9:00 PM ET; each participant claims individually.
Partners (optional, not guaranteed): Baseten ($100, use model ID `meta-models/muse-spark-open-1026`, not the ID in Baseten's docs), Modal ($100), Fireworks ($25 for shortlisted teams).

## 3. Disqualification and "anti-project" risks

Disqualified if a project violates legal, ethical or platform policies, or uses code, data or assets without rights. Sample anti-projects named by the organisers include: **AI that generates and gives medical advice**, basic RAG apps, simple image analyzers, **simple "AI for Education" chatbots**, personality analyzers, and anything political or involving war.

### How MINDTRACE stays clear of these

| Risk | Our response |
|---|---|
| "Medical advice" | MINDTRACE gives **educational** observations and classroom supports. It never names a condition as a finding, never gives probabilities, never advises treatment. Referral guidance says "consider a qualified professional" |
| "Simple education chatbot" | There is no chatbot. It is an **agent that runs a multi-step investigation** over real assessment evidence, picks and generates a follow-up task, and verifies the outcome |
| "Basic RAG" | The core data is structured assessment evidence computed by code, not document retrieval |
| "Simple image analyzer" | Images are generated (Muse Image) as teacher-approved visual supports, not analysed |
| "Personality analyzer" | No personality or trait inference about children |
| Positioning | Lead every description with "investigate, support, verify". Show the non-diagnostic notice in the UI and the video |

Ask in the Discord `#questions` channel on Day 1: "Does a classroom reading-support agent that gives non-diagnostic educational observations and referral guidance fit the policy on medical advice?" Record the answer below.

> Organiser answer (fill in): ______________________

### Other questions to ask in `#questions` on Day 1

1. Stage 1 says projects must "reasonably use Meta Model API and/or open-weight models to build the project". Does this mean models used **inside the product**, or also tools used **to build it**? (We do both: Meta models power the product, and Muse Code is used to build it.)
2. Are planning documents (PRD, specs) written before Oct 27 acceptable in the public repository if the README labels them as pre-event planning?
3. Is it acceptable for a product to include general educational guides that name conditions such as dyslexia or ADHD, provided it gives no individual diagnoses or medical advice?

> Organiser answers (fill in): ______________________

## 4. Judging

**Stage 1 (pass/fail):** fits the theme and reasonably uses the Meta Model API and/or open-weight models, built during the hackathon.

**Stage 2 (0 to 10 each):**

| Criterion | Weight | What we must show |
|---|---|---|
| Impact | 30% | Real teachers without specialist access; global design; a verified outcome, not a score |
| Use of Meta AI tooling | 25% | More than one integration, used creatively: Muse Spark as a tool-calling agent, Muse Voice Transcribe for read-aloud evidence, Muse Image for visual supports, optional open-weight model for privacy mode |
| Technical depth and execution | 20% | Deterministic evidence engine, verifier pass, schema validation, RLS, tests, clean failure handling |
| Demo | 25% | Works live, no dead air, clear 3-minute story |

**Stage 3:** top 5 per track, final-round live video judging with the same rubric.

## 5. Bonus prizes to target

| Bonus | Our angle |
|---|---|
| Best Agentic Use-Case ($5K) | The investigate, support, verify loop runs as a multi-step tool-calling agent with a verifier |
| Best Build on Meta Open Weight Models ($10K) | Privacy mode: run the investigation on Muse Spark Open via partner inference. Stretch goal (P1) |
| Best Creative Build ($5K) | Muse Image generates reviewed visual supports (picture cue cards, visual schedules). Stretch goal (P1) |
| Community Vote ($10K) | Public gallery; share a clear demo |
| Most Viral ($20K) | Post the demo on X and submit the link; engagement counts to Nov 8 EOD |

## 6. Compliance checklist

Pre-event (docs only, no app code)
- [ ] Join the Discord; introduce MINDTRACE in `#intros`.
- [ ] Claim Meta API credits (card on file, spend-limit alert set).
- [ ] Request Baseten and Modal credits if using open weights.
- [ ] Verify API access with a single `curl` (no repo needed).

During the event
- [ ] First commit of application code on or after Oct 27. Commit history reflects real daily progress.
- [ ] No code, data or assets from earlier projects.
- [ ] Third-party libraries listed in `docs/THIRD_PARTY.md` with licences.
- [ ] Repository is public; `.env` files are not committed; secret scan is clean.
- [ ] Synthetic data only; the demo discloses that the learner is a synthetic profile and the voice is an adult.
- [ ] README states what was built during the hackathon and what Meta models are used and where.
- [ ] No claims of diagnosis, clinical validity or legal compliance.

Submission
- [ ] Repository URL works in a logged-out browser.
- [ ] Demo video (3:00 max) is publicly viewable and shows only hackathon-built functionality.
- [ ] Live product URL works from a clean browser and a phone.
- [ ] Everyone who contributed is listed on the submission page.
- [ ] Optional: X post link submitted for the Viral prize.
- [ ] Submitted by **Nov 3, 9:00 PM Lagos time**, leaving Nov 4 as buffer.
