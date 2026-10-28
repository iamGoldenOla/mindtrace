# ASSESSMENT_SPEC.md: Reading assessment and games

Purpose: gather **countable, explainable evidence** about how a learner reads, so an adult can investigate and a support can be compared fairly before and after.

These activities are **not validated screening instruments**. They have no norms. Every result is shown relative to the learner's own earlier attempts. The UI says so.

## 1. Activity set

| Activity | Skill | Priority | Evidence recorded |
|---|---|---|---|
| **Read-Aloud Trace** (hero) | Oral reading of a short passage | P0 | Transcript, per-word outcome, error categories, self-corrections, support condition |
| **Sound Match** | Letter-sound and rhyme matching | P0/P1 | Item, choice, correct, hints used, response time (context only) |
| **Word Builder** | Blending sounds into words | P1 | Tiles chosen, order, correct, hints used |
| **Number Sense Quest** | Quantity, number relationships | P1 | Item, response, error pattern |
| **Focus and Pattern** | Following a short rule over a sequence | P2 | Targets hit, misses, wrong taps, by block. Framed as task-following under a stated condition, never as an attention-disorder test |

Every activity: pause, repeat instruction, visible captions for all spoken text, adjustable size, no flashing, no countdown pressure, an adult-visible "skip" that is recorded as skipped (not wrong).

## 2. Read-Aloud Trace (hero)

### 2.1 Flow

1. Teacher selects the form (A, B or C) and condition: `baseline` or a named `support` (chosen later from the plan).
2. Learner screen shows the passage in large text. A supervising adult presses **Start reading**.
3. Browser records audio (MediaRecorder) while the learner reads. Sentences can be highlighted by the adult tapping; this is optional.
4. **Stop** sends audio to `/api/attempts/[id]/transcribe`. The server calls Muse Voice Transcribe and discards the audio.
5. Transcript is shown to the teacher with the passage aligned beside it. The teacher can fix transcription mistakes before evidence is computed.
6. The evidence engine produces the **Trace**: one segment per target word coloured by outcome (see `DESIGN.md`).

### 2.2 Passage forms (original text; unvalidated; matched by design for length and sound patterns)

Each form has 31 words and the same four-sentence structure, built mostly from short-vowel words with a few digraphs and blends. The forms are matched by design for length and structure only. Difficulty equivalence is **not validated** (for example, "chair" in Form C has an r-controlled vowel that the other forms lack). Review the forms with a teacher, adjust words if needed, and keep the comparison caveats in the UI.

**Form A**
> Sam has a red hat. The hat is on the bed. A dog sits on the mat by the shed. Then the dog digs in the sand and finds a shell.

**Form B**
> Tom has a tan cap. The cap is in the bag. A cat naps on the rug by the bench. Then the cat hops up the steps and finds a fish.

**Form C**
> Ben has a pink bib. The bib is on the chair. A pup sits on the log by the chest. Then the pup digs in the grass and finds a shell.

Store as `assessment_definitions.target = { "words": [...], "sentences": [...] }` with a `version`.

### 2.3 Normalisation

Lowercase; strip punctuation; collapse whitespace; expand nothing; treat British and American spellings of the passage words as identical (none expected in v1). Filler tokens ("um", "uh", "er") are removed and counted as hesitations (not errors). Immediate repetitions of the same word are collapsed and counted as `repetition`.

### 2.4 Alignment and outcomes (`lib/reading/align.ts`)

Algorithm: word-level minimum edit distance (Levenshtein) between target and transcript tokens with backtracking to get matches, substitutions, deletions (omissions) and insertions. Return an ordered list of word records:

```ts
type WordOutcome = {
  index: number;            // target word index (or -1 for insertions)
  target?: string;
  observed?: string;
  outcome: "match" | "substitution" | "omission" | "insertion";
  category?: ErrorCategory;
  selfCorrected?: boolean;
  evidenceId: string;       // stable: E-<attemptShort>-<wNN> or E-<attemptShort>-<iNN> for insertions
};
```

### 2.5 Error categories (`ErrorCategory`)

Computed deterministically from letter-level comparison of target and observed. A word can have **one** primary category, chosen in this order:

1. `visual_reversal`: target and observed are reversals or classic confusions (b/d, p/q, was/saw, on/no).
2. `vowel_substitution`: same consonant skeleton, vowel differs (hat/hit).
3. `consonant_substitution`: same vowel, one consonant differs (hat/hot is vowel; hat/had is consonant).
4. `ending_omission`: observed is the target with its final letter or inflection missing (digs/dig).
5. `onset_match_only`: first letter matches, rest differs.
6. `unrelated_word`: edit distance greater than half the word length.
7. `other_substitution`.

Omissions and insertions are separate outcomes, not categories.

### 2.6 Summary metrics (per attempt)

- `words_total`, `words_correct`, `accuracy` (words_correct / words_total)
- `substitutions`, `omissions`, `insertions`, `self_corrections`, `repetitions`, `hesitation_tokens`
- `category_counts` by `ErrorCategory`
- `longest_correct_run`
- `words_per_minute` **only if** the transcript includes timing; otherwise `null`. Rate is shown with the caution "recording and recognition conditions affect this".
- `transcript_corrected_by_teacher` (boolean) and `words_edited`
- `evidence_quality`: `sufficient`, `limited` (fewer than 20 target words attempted), or `insufficient` (empty transcript, ASR failure, or more than 30 percent of words edited by hand)

Nothing in these metrics is a diagnosis or a risk score.

### 2.7 Matching and comparison (`lib/reading/compare.ts`)

A follow-up is comparable when it uses a **different matched form** (A/B/C) and the same activity, with the support condition applied. The comparison returns:

```ts
{
  comparable: boolean,
  reasons_not_comparable: string[],
  baseline: Metrics, followup: Metrics,
  delta: { accuracy: number, substitutions: number, omissions: number, byCategory: Record<ErrorCategory, number> },
  direction: "improved" | "no_clear_change" | "declined",
  caveats: string[]    // always includes: single attempt, forms not validated as equal, other factors may differ
}
```

Direction rule: `improved` only if accuracy rises by at least 3 words out of 31 **and** error categories do not worsen; `declined` mirrors that; otherwise `no_clear_change`. These thresholds are conservative placeholders, documented in the UI and not clinical.

UI wording template: "After [support], 27 of 31 words were read as written, up from 22 of 31 on a comparable passage. This does not show that [support] caused the change."

## 3. Sound Match (P0/P1)

- 12 items. Each item: a spoken or written sound or word cue, and 3 picture or letter choices.
- Spoken cues use the browser speech synthesis with a visible caption (voice is optional and not evidence of anything).
- Records: choice, correct, hints used (replay sound, show highlight), response time as context.
- Item types: initial sound, rhyme, letter-sound, syllable count.
- Error pattern: confusion pairs (e.g. b/d, m/n), recorded per pair.

## 4. Word Builder (P1)

- Learner taps sound tiles to build a target word shown as a picture.
- Records tile order, backspaces, hints.
- Error categories: missing sound, extra sound, order error, wrong vowel.

## 5. Number Sense Quest (P1)

- Items: compare quantities, number line placement, add and subtract within 20, place value (tens and ones).
- Error patterns: "subtracts smaller from larger", "counts on by one from the wrong start", place-value swaps. Each pattern is code-detected from answer sets; the model only explains.

## 6. Focus and Pattern (P2)

- Three short blocks (about 60 seconds each) of "tap the star, not the moon" at a gentle pace.
- Records hits, misses, wrong taps, by block, and the condition (quiet screen, with a visual cue, with a break).
- **Must never** use words like "attention disorder test". Its report line is: "This shows how the learner followed a simple rule under these conditions. Many things affect performance, including tiredness, device lag, and instructions."

## 7. Language and region

- Each definition has `language`. The UI records the language of every attempt.
- English forms only at launch. The i18n layer must allow adding forms for other languages without code changes. A new language requires: native-speaker review of items, a note on writing-system effects (regular vs irregular spelling), and a `validation_status` of `unvalidated` until independently checked.
- The report must say when an assessment is not validated for the learner's language.

## 8. Data captured per event (for the evidence table)

`attempt_id`, `evidence_id`, `item_ref`, `target`, `observed`, `outcome`, `error_category`, `hints_used`, `support_used[]`, `response_ms` (only where meaningful), timestamps. **No audio.**

## 9. Tests

- Alignment: exact match, one substitution, omission, insertion, repetition, filler words, empty transcript, transcript longer than target.
- Category rules: each category has two positive and one negative case.
- Comparison: improved, unchanged, declined, non-comparable forms.
- Property test: counts of matches plus substitutions plus omissions always equal target length.
