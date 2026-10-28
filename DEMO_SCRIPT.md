# DEMO_SCRIPT.md: The three-minute video

Hard limit **3:00**. The video is a primary judging artifact, alongside the code and the live product. It must show only what was built during the hackathon, and it must make judges understand the loop in the first 30 seconds.

Use the seeded synthetic learner **L-0001**. State on screen: "Synthetic learner. Voice: adult." Do not show real children, real names, or real schools.

## Story in one line

A teacher doesn't know why a child stumbles over words. MINDTRACE investigates with real evidence, suggests a support, and checks whether it worked.

## Timeline

| Time | Screen | Voiceover (draft) |
|---|---|---|
| 0:00 to 0:15 | Landing page headline, then a teacher at a desk (title card only) | "Most teachers have no specialist to ask why a child struggles to read. MINDTRACE is an AI agent that helps them investigate, support, and verify." |
| 0:15 to 0:35 | Teacher dashboard, open L-0001, record the concern in one sentence | "Here, a teacher records a concern. No diagnosis is asked for. Everything starts from what was observed." |
| 0:35 to 1:05 | Read-aloud screen, the adult reads Form A; Muse Voice Transcribe returns; the Trace builds | "The child reads aloud. Muse Voice Transcribe turns speech into a transcript, the audio is discarded, and our code aligns it word by word. This is the Trace: every word is evidence." |
| 1:05 to 1:50 | Run investigation: progress steps; report appears; click an evidence chip and the matching Trace word highlights | "Muse Spark runs as an agent. It reads the evidence, checks history, and weighs competing explanations, including language and format. A verifier then checks every claim against the evidence. Nothing here diagnoses; it shows patterns worth exploring and what to try." |
| 1:50 to 2:15 | Choose support (for example sound-by-sound pointing); optional generated picture cue (Muse Image); assign matched Form B follow-up | "The teacher picks a support. MINDTRACE assigns a matched follow-up so the comparison is fair." |
| 2:15 to 2:40 | Form B read aloud with the support; comparison screen shows before and after Traces | "After the support, 27 of 31 words were read as written, up from 22. The wording is careful: it doesn't claim the support caused the change." |
| 2:40 to 3:00 | Meta tools slide, guardrails slide, URL and repository | "Built this week on Muse Spark, Muse Voice Transcribe and Muse Image, with open-weight privacy mode on Muse Spark Open. It gives educational observations, not diagnoses. Built for teachers anywhere." |

Remove the Muse Image or privacy-mode lines from the voiceover if those features were not completed. The numbers in the comparison line (27 of 31, up from 22) are placeholders: say whatever the seeded run actually shows, and never edit results to look better.

## Production checklist

- [ ] Script timed with a stopwatch; leave 5 seconds of slack.
- [ ] Rehearse the hero path three times; record the best take.
- [ ] Seed reset immediately before recording.
- [ ] Evaluation set passed that day; no failed verification during the take.
- [ ] Use a quiet room and a clear adult voice; check the transcription beforehand.
- [ ] 1080p, readable text at the size of a phone screen, captions on.
- [ ] A visible "built during the hackathon" statement and the commit history shown for two seconds.
- [ ] Show the non-diagnostic notice in the report footer on screen.
- [ ] No API keys, emails, or personal data visible; check the browser tabs.
- [ ] Upload publicly; test the link in a logged-out browser.
- [ ] Post on X with a 20-second cut; submit the link for the Viral prize.

## If the live demo fails

Record the video from a real, live run of the product. If a take fails, record it again; never splice in pre-generated or hard-coded results. Keep a spare screen recording of an earlier real run in case the live site is down during judging, and label it "Recording" if you ever show it.

## Questions judges may ask (prepare answers)

1. *Is this medical advice or a diagnosis?* No. Output is educational observation, with referral wording only after a sustained pattern plus teacher observations. The verifier and filters block condition labels and probabilities.
2. *How do you handle accents and child voices?* Transcripts are editable, evidence quality is flagged, and we make no accuracy claims. Language support is designed to be added per language with native review.
3. *Why Muse Spark and not another model?* The hackathon requires Meta models; Muse Spark handles tool calling, and the provider layer lets us run Muse Spark Open for privacy.
4. *What did you build during the hackathon?* Everything in the repository's application code; show the commit history from Oct 27.
5. *How is children's data protected?* Synthetic data in the demo, minimal fields, no audio retention, RLS, a model allowlist that excludes data-sharing variants.
6. *Does it work globally?* Language and region packs are in the design; only English forms are shipped, and the product says when an assessment isn't validated for a language.
