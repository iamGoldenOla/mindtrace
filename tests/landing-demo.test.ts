import { describe, expect, it } from "vitest";
import { align } from "../lib/reading/align";
import {
  BASELINE_A,
  BASELINE_CORRECT,
  BASELINE_TRANSCRIPT,
  EXAMPLE_STRIP,
  FOLLOWUP_B,
  FOLLOWUP_CORRECT,
  FOLLOWUP_TRANSCRIPT,
  FORM_A_TARGET,
  FORM_B_TARGET,
  countCorrect,
} from "../lib/landing-demo";

function alignCorrectCount(
  target: string[],
  transcript: string,
  attemptShort: string
): number {
  const { records } = align(target, transcript, attemptShort);
  return records.filter((r) => r.index >= 0 && r.outcome === "match").length;
}

describe("landing demo data", () => {
  it("before caption equals the computed count on the drawn transcript", () => {
    // The "Before" caption shows BASELINE_CORRECT of 31.
    expect(BASELINE_A).toHaveLength(31);
    expect(FORM_A_TARGET).toHaveLength(31);
    expect(countCorrect(BASELINE_A)).toBe(BASELINE_CORRECT);
    expect(BASELINE_CORRECT).toBe(
      alignCorrectCount(FORM_A_TARGET, BASELINE_TRANSCRIPT, "caption-check")
    );
  });

  it("after caption equals the computed count on the drawn transcript", () => {
    // The "After" caption shows FOLLOWUP_CORRECT of 31.
    expect(FOLLOWUP_B).toHaveLength(31);
    expect(FORM_B_TARGET).toHaveLength(31);
    expect(countCorrect(FOLLOWUP_B)).toBe(FOLLOWUP_CORRECT);
    expect(FOLLOWUP_CORRECT).toBe(
      alignCorrectCount(FORM_B_TARGET, FOLLOWUP_TRANSCRIPT, "caption-check")
    );
  });

  it("follow-up improves on baseline by a clear margin", () => {
    // Guards the before/after story: a gain of at least 3 words on 31.
    expect(FOLLOWUP_CORRECT - BASELINE_CORRECT).toBeGreaterThanOrEqual(3);
  });

  it("every substitution names the heard word, nothing else does", () => {
    for (const list of [EXAMPLE_STRIP, BASELINE_A, FOLLOWUP_B]) {
      for (const w of list) {
        if (w.outcome === "substitution") {
          expect(w.heard, w.word).toBeTruthy();
          expect(w.heard, w.word).not.toBe(w.word.toLowerCase());
        } else {
          expect(w.heard, w.word).toBeUndefined();
        }
      }
    }
  });

  it("skipped words are drawn, not dropped", () => {
    // Omissions stay visible as struck-through segments and count against
    // the caption, so the figures reconcile with the drawn strips.
    for (const list of [BASELINE_A, FOLLOWUP_B]) {
      const nonMatch = list.filter((w) => w.outcome !== "match").length;
      expect(list.length - countCorrect(list)).toBe(nonMatch);
      expect(nonMatch).toBeGreaterThan(0);
    }
  });

  it("example strip stays short enough to animate under 700ms", () => {
    // 250ms duration + 45ms stagger; tested bound, not timing.
    const totalMs = 250 + EXAMPLE_STRIP.length * 45;
    expect(totalMs).toBeLessThanOrEqual(700);
  });
});
