// Illustrated landing-page demo data. SYNTHETIC DATA. NOT REAL CHILDREN.
// These word lists power the animated example Trace and the before/after
// comparison on the landing page. They are hand-built illustrations, not
// assessment results. Counts are asserted in tests/landing-demo.test.ts.

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

/** Form A baseline illustration: 22 of 31 read as written. */
export const BASELINE_A: DemoWord[] = [
  m("Sam"),
  m("has"),
  o("a"),
  s("red", "rid"),
  s("hat", "hit"),
  m("The"),
  m("hat"),
  m("is"),
  o("on"),
  m("the"),
  s("bed", "bad"),
  m("A"),
  m("dog"),
  m("sits"),
  m("on"),
  m("the"),
  s("mat", "met"),
  m("by"),
  m("the"),
  m("shed"),
  m("Then"),
  m("the"),
  m("dog"),
  m("digs"),
  o("in"),
  m("the"),
  s("sand", "send"),
  m("and"),
  m("finds"),
  m("a"),
  s("shell", "sell"),
];

/** Form B follow-up illustration with a support applied: 27 of 31. */
export const FOLLOWUP_B: DemoWord[] = [
  m("Tom"),
  m("has"),
  m("a"),
  s("tan", "ten"),
  m("cap"),
  m("The"),
  m("cap"),
  m("is"),
  m("in"),
  m("the"),
  m("bag"),
  m("A"),
  m("cat"),
  m("naps"),
  m("on"),
  m("the"),
  s("rug", "rag"),
  m("by"),
  m("the"),
  m("bench"),
  m("Then"),
  m("the"),
  m("cat"),
  m("hops"),
  o("up"),
  m("the"),
  s("steps", "stops"),
  m("and"),
  m("finds"),
  m("a"),
  m("fish"),
];

export function countCorrect(words: DemoWord[]): number {
  return words.filter((w) => w.outcome === "match").length;
}

export const BASELINE_CORRECT = 22;
export const FOLLOWUP_CORRECT = 27;
export const SUPPORT_NAME = "sound-by-sound pointing";
