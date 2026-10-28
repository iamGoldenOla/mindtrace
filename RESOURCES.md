# RESOURCES.md: Inclusive education resource library

The library gives teachers and parents trusted guidance that links to what the report found. A resource is only shown in a report when `review_status = 'reviewed'`.

## 1. Rules

1. **A human reviews every resource.** Open the source, confirm the publisher and that the content matches the summary.
2. **No AI-generated links, titles, or video IDs.** A model may suggest a topic to search for; a person finds and verifies the resource.
3. **Original sources only.** Link to or embed the publisher's page or official video. Do not copy or re-host copyrighted text, transcripts, or video.
4. **Every resource has a practical action**: one thing a teacher can try this week.
5. **Tag by language and region.** The library must support resources in other languages and region-specific referral pages.
6. **Date and re-check.** Record the review date; re-check links before submission.
7. **Prefer** international bodies, national education or disability agencies, professional associations, university or charity guidance, and recognised organisations for the condition area.
8. **Avoid** commercial promotion, unverified claims of cures, and content that labels children by condition in stigmatising ways.

## 2. Record format

```json
{
  "title": "",
  "publisher": "",
  "url": "",
  "type": "video | guide | article | training | tool",
  "language": "en",
  "topics": ["inclusive_education", "reading", "dyslexia_related", "attention_executive", "autism_related", "maths", "speech_language", "hearing_vision", "multilingual", "classroom_adjustments", "parent_guidance", "referral"],
  "audience": ["teacher", "parent", "specialist"],
  "region": ["global"],
  "summary": "Two sentences in our own words.",
  "practical_action": "One concrete thing to try.",
  "review_status": "unreviewed",
  "reviewed_on": null,
  "reviewer": null
}
```

## 3. Starting candidates (all **unreviewed**)

These came from the product planning stage. None has been verified by a person yet. Open each, confirm it, and update `review_status` before it appears in the app.

| Publisher | Topic | URL | Status |
|---|---|---|---|
| UNICEF | Inclusive education foundations | https://www.unicef.org/education/inclusive-education | unreviewed |
| British Dyslexia Association | Teaching for neurodiversity: training videos | https://www.bdadyslexia.org.uk/advice/educators/teaching-for-neurodiversity/webinar-training-teaching-for-neurodiversity | unreviewed |
| UNICEF Nigeria | Inclusive classroom example (hearing loss) | https://www.unicef.org/nigeria/stories/how-one-teacher-opens-classroom-children-hearing-loss | unreviewed |
| International Dyslexia Association | Classroom guidance for reading difficulties | https://dyslexiaida.org/dyslexia-in-the-classroom/ | unreviewed |

### Gaps to fill before submission (find and review by hand)

- A reputable guide on autism-related classroom support (national autism society or health agency).
- Attention and executive-function classroom strategies (education agency or recognised charity).
- Supporting learners who are learning in a second language.
- Parent guidance on supporting reading at home.
- Referral pathway pages for at least three regions (UK, US, Nigeria or other) for `region` packs.
- Two or three reviewed **YouTube** videos from official channels of the organisations above (a person must watch each one and verify the channel).

## 4. Surfacing in the product

- Reports list up to 4 resources, chosen by topic match, language, and audience.
- Each shows publisher, a short summary, the practical action, and "Open at the source".
- The teacher can record "this informed my plan", which is stored on the support strategy.
- Videos open on the publisher's page or use the official embed if permitted. If embedding is not permitted, link out.

## 5. Concern guides (content we write)

Ten parts per guide (see `PRD.md` FR-13). Written by us, reviewed by a person with relevant experience, versioned, and linked to resources:

1. Reading and possible dyslexia-related difficulties
2. Attention and executive-function difficulties
3. Autism-related communication, predictability and sensory needs
4. Mathematics and persistent numeracy difficulties
5. Speech and language
6. Hearing and vision access
7. Writing and motor demands
8. Learning in a second or additional language
9. Anxiety, fatigue and environment
10. Safeguarding note (what MINDTRACE cannot assess and who to tell)

Every guide ends with the non-diagnostic statement from `DESIGN.md` section 7 and the conditions under which to seek a qualified professional.
