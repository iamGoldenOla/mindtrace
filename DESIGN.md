# DESIGN.md: Visual and interaction design

## 1. Design brief

**Subject:** a tool for teachers who are investigating how a child reads, and for the supervised activity the child completes.
**Primary job:** let a teacher see *what actually happened* when a learner read, understand it at a glance, and act on it.
**Feeling:** calm, careful, trustworthy, attentive. Closer to a good observation notebook than to a medical device or a classroom game.
**The memorable thing (spend boldness here only):** the **Trace**, a horizontal ribbon of the passage where every word is a segment that records what happened to it. The rest of the interface stays quiet so the Trace carries the product.

Avoid: cream-and-terracotta palettes, near-black with a neon accent, newspaper-column layouts, stacks of identical rounded cards with soft grey shadows, all-caps eyebrow labels, middle-dot meta strings, arrows on buttons, one-word emphasis in headlines, and any clinical-looking iconography (stethoscopes, brains, puzzle pieces).

## 2. Design tokens

### Colour (teacher interface)

| Token | Hex | Role |
|---|---|---|
| `daylight` | `#EEF3F4` | Page background (cool, pale blue-grey) |
| `paper` | `#FFFFFF` | Working surfaces where reading text sits |
| `ink` | `#17242E` | Text, primary lines |
| `pine` | `#1F5C57` | Matched, verified, primary action |
| `marigold` | `#D69A1E` | Pattern worth exploring (fill only; pair with `ink` text) |
| `madder` | `#A9443B` | Omissions and differences (used sparingly) |
| `dusk` | `#6B6F9C` | Uncertain, insufficient, or teacher-edited |
| `rule` | `#C9D4D8` | Hairlines and dividers |
| `mist` | `#DCE6E8` | Quiet fills |

Contrast: `ink` on `daylight` and `paper` passes AA; `pine`, `madder`, `dusk` on `paper` pass AA for text; **`marigold` never carries text**, it is a fill with `ink` text over it. Check every pair with a contrast tool before shipping.

### Colour (learner activity screen: "Quiet")
Background `#F5F7F4`; text `ink`; one accent `pine` for the Start button. No other colour while the child reads. Optional reading tints chosen by the adult: none, pale blue `#E8F1F8`, pale yellow `#FAF3D9`, pale green `#E6F3E8`. These are preferences, **not** treatments; do not claim they help any condition.

### Typography

| Role | Family | Notes |
|---|---|---|
| Headings | Literata (serif, designed for screens) | 600 weight; tight tracking off; sentence case |
| Interface and body | Atkinson Hyperlegible | 400, 600; designed for legibility |
| Learner passage | Atkinson Hyperlegible (default); selectable: Lexend, system sans | Selection is a preference, not a claim |
| Numbers in tables | Atkinson Hyperlegible with tabular figures | |

Scale (px): 14, 16, 18, 22, 28, 36. Passage text: 32 to 44 (adult adjusts). Body line-height 1.55 (sans) and 1.6 (serif). Line length 45 to 70 characters. Letter-spacing and line-height adjustable in settings.

### Spacing, shape, depth
- 8px base grid; section gaps 32 and 48.
- Radius: 4px on inputs and buttons; 0 on the Trace segments; 12px only on the modal.
- Structure comes from whitespace and `rule` hairlines, not boxes. A panel gets a surface (`paper`) only when it holds reading text or a form. No default shadows; one soft elevation for the modal and menus.

## 3. The Trace

A row of segments, one per target word, in reading order, wrapping at sentence boundaries.

| Outcome | Mark (never colour alone) |
|---|---|
| Matched | Solid `pine` bar under the word |
| Substitution | `marigold` bar with a notch, and the heard word appears above in small type |
| Omission | `madder` bar with a visible gap, word shown struck through lightly |
| Insertion | Small `dusk` tick between words with the inserted word above |
| Self-correction | Small curl mark above, bar in `pine` |
| Insufficient or teacher-edited | Dashed `dusk` bar |

Behaviour:
- Each segment is a button: focus or hover shows evidence ID, target, heard, category, and whether the teacher edited it.
- Selecting a segment highlights every sentence in the report that cites that evidence ID, and vice versa (this is how teachers see the AI's claims tied to evidence).
- A "Show as table" toggle presents the same data in an accessible table.
- Comparison view stacks the **before** Trace above the **after** Trace on a shared baseline, with a quiet difference marker between them.
- Motion: when evidence first appears, segments settle left to right once (under 700 ms). With `prefers-reduced-motion`, they appear instantly.

## 4. Layout concepts

### Investigation workspace (desktop)

```
+------------------------------------------------------------------+
| Learner L-0001   Reading concern: struggles with unfamiliar words |
+----------------+-------------------------------------------------+
| Evidence rail  |  Trace  (Form A, baseline)                      |
|                |  ##_##_####_#__###_##                           |
| Attempts       |-------------------------------------------------|
| Observations   |  Report (pending your review)                   |
| Resources      |   What was recorded                             |
|                |   Patterns and other explanations               |
|                |   What to try                                   |
|                |   When to seek more help                        |
|                |-------------------------------------------------|
|                |  Support plan  [choose]  [assign follow-up]     |
+----------------+-------------------------------------------------+
```

Alignment: left-aligned text; the Trace and report share one column of about 720px; the rail is 260px.

### Mobile and tablet
The rail becomes a bottom sheet. The Trace scrolls vertically by sentence. The reading activity runs full-screen on a tablet in landscape or portrait.

### Dashboard ("Today")
A plain list of learners needing follow-up (due date, support in progress, last result), then recent attempts, then open investigations. No metrics tiles. Each row ends with one clear action.

### Comparison screen
Two Traces stacked, a one-sentence neutral summary, the careful-wording caveat, and the decision control (continue, change, review, refer).

### Activity screen (learner)
Single column, large text, one primary button, pause and repeat controls, captions for any spoken instruction, no timers, no points, no confetti.

### Resource library
List with filters (topic, language, audience, type). Each row shows source, a two-line summary, and "What to try next". Video items open the publisher's page or embed where permitted.

### Landing page
SNAP structure (Story, Need, Answer, Proof):
1. **Story:** a teacher watches a child hesitate over a word and has no idea why.
2. **Need:** knowing what is getting in the way, what to try, and whether it worked, without waiting months for a specialist.
3. **Answer:** the investigate, support, verify loop with the Trace shown live.
4. **Proof:** an animated real Trace from the demo learner, a before and after comparison, and the plain statement "MINDTRACE gives educational observations, not diagnoses."

## 4a. Navigation
Top bar: product name, active learner (when in one), a sign-out menu showing the role. Left rail inside a learner: Overview, Observations, Activities, Investigations, Supports, Resources. Keyboard shortcuts are not required.

## 5. Components

Button (primary, secondary, quiet), text input, textarea, select, radio group, checkbox, segmented control, tabs, stepper (the Observe to Verify loop, which is a real sequence), table, Trace, evidence chip (ID plus link to Trace), banner (info, caution), toast, modal, progress with text ("Reading evidence", "Checking history", "Weighing explanations", "Verifying claims"), empty state, skeleton.

State matrix for every interactive component: default, hover, focus-visible (2px `pine` outline with 2px offset), active, disabled, loading, error.

## 6. Accessibility

- WCAG 2.2 AA minimum; visible focus; full keyboard operation; logical heading order.
- Every Trace segment has an accessible name, for example "Word 7, target hat, heard hit, vowel substitution".
- All spoken instruction has captions; audio is never required.
- Text resizing to 200 percent without loss; adjustable letter and line spacing.
- No flashing, no autoplay sound, no countdowns.
- Reduced motion respected throughout.
- Colour is never the only carrier of meaning.
- Targets at least 44px on touch.
- Test with a screen reader and keyboard-only on the hero path before submission.

## 7. Copy rules

- Sentence case. Plain verbs. One job per sentence.
- Name actions consistently across the flow: **Start reading**, **Stop and save**, **Run investigation**, **Approve report**, **Save support plan**, **Assign follow-up**, **Compare results**. The toast after "Approve report" says "Report approved".
- Never use: "diagnose", "symptoms of", "at risk", "disorder", "detect", "screening result" as a finding. Use: "observed", "pattern", "worth exploring", "possible explanation".
- Standing notice (report footer and landing page): "MINDTRACE gives educational observations, not diagnoses. If you have concerns about a child's development or health, talk to a qualified professional."
- Errors say what happened and how to fix it, with no apology and no blame. Example: "The recording could not be transcribed. Your recording was not saved. Try again, or type what you heard."
- Empty states invite action. Example: "No readings yet. Start a baseline reading to see the Trace."
- The AI's output is labelled "Draft for your review" until approved.

## 8. Iconography
Lucide icons, 1.5px stroke, used sparingly and always with text. No decorative illustration in the teacher interface. Generated visual supports (Muse Image) appear only inside the support plan, after teacher approval.

## 9. Review before build
Before building any screen, the agent writes a short plan (tokens used, layout, alignment), checks it against this file and the rules above, and revises anything that reads like a generic template.
