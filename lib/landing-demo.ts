// Illustrated landing-page demo data. SYNTHETIC DATA. NOT REAL CHILDREN.
// The before/after figures are computed by align() from the exact
// transcripts drawn below. There are no hand-typed counts: the captions in
// app/trace-demo.tsx use BASELINE_CORRECT and FOLLOWUP_CORRECT, which come
// from countCorrect() over the align()-derived word lists.
import { align } from "@/lib/reading/align";

export type DemoOutcome = "match" | "substitution" | "omission";

export interface DemoWord {
  word: string;
  outcome: DemoOutcome;
  /** Heard word. Present exactly when outcome is "substitution". */
  heard?: string;
}

function m(word: string): DemoWord {
  return { word, outcome: "match" };
}

function s(word: string, heard: string): DemoWord {
  return { word, outcome: "substitution", heard };
}

function o(word: string): DemoWord {
  return { word, outcome: "omission" };
}

/** Short strip used for the first "What the teacher sees" example. */
export const EXAMPLE_STRIP: DemoWord[] = [
  m("Sam"),
  m("has"),
  m("a"),
  m("red"),
  s("hat", "hit"),
  m("The"),
  m("hat"),
  m("is"),
];

/** Form A target (31 words, ASSESSMENT_SPEC.md section 2.2). */
export const FORM_A_TARGET: string[] = [
  "Sam", "has", "a", "red", "hat", "The", "hat", "is", "on", "the", "bed",
  "A", "dog", "sits", "on", "the", "mat", "by", "the", "shed", "Then",
  "the", "dog", "digs", "in", "the", "sand", "and", "finds", "a", "shell",
];

/** Form B target (31 words, matched to Form A by design). */
export const FORM_B_TARGET: string[] = [
  "Tom", "has", "a", "tan", "cap", "The", "cap", "is", "in", "the", "bag",
  "A", "cat", "naps", "on", "the", "rug", "by", "the", "bench", "Then",
  "the", "cat", "hops", "up", "the", "steps", "and", "finds", "a", "fish",
];

/** Exact transcript drawn in the "before" strip. */
export const BASELINE_TRANSCRIPT: string =
  "sam has rid hit the hat is the bad a dog sits on the met by " +
  "the shed then the dog digs the send and finds a sell";

/** Exact transcript drawn in the "after" strip. */
export const FOLLOWUP_TRANSCRIPT: string =
  "tom has a ten cap the cap is in the bag a cat naps on the rag " +
  "by the bench then the cat hops the stops and finds a fish";

function toDemoWords(
  target: string[],
  transcript: string,
  attemptShort: string
): DemoWord[] {
  const { records } = align(target, transcript, attemptShort);
  return records
    .filter((r) => r.index >= 0)
    .map((r) => {
      const word = target[r.index];
      if (r.outcome === "match") return m(word);
      if (r.outcome === "substitution") return s(word, r.observed ?? "");
      return o(word);
    });
}

/** Form A baseline illustration, drawn word for word from align() output. */
export const BASELINE_A: DemoWord[] = toDemoWords(
  FORM_A_TARGET,
  BASELINE_TRANSCRIPT,
  "landing-before"
);

/** Form B follow-up illustration with a support applied. */
export const FOLLOWUP_B: DemoWord[] = toDemoWords(
  FORM_B_TARGET,
  FOLLOWUP_TRANSCRIPT,
  "landing-after"
);

export function countCorrect(words: DemoWord[]): number {
  return words.filter((w) => w.outcome === "match").length;
}

export const BASELINE_CORRECT = countCorrect(BASELINE_A);
export const FOLLOWUP_CORRECT = countCorrect(FOLLOWUP_B);
export const SUPPORT_NAME = "sound-by-sound pointing";
