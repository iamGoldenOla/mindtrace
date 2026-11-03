import { describe, expect, it } from "vitest";
import {
  BASELINE_A,
  BASELINE_CORRECT,
  EXAMPLE_STRIP,
  FOLLOWUP_B,
  FOLLOWUP_CORRECT,
  countCorrect,
} from "../lib/landing-demo";

describe("landing demo data", () => {
  it("baseline illustration reads 22 of 31 as written", () => {
    expect(BASELINE_A).toHaveLength(31);
    expect(countCorrect(BASELINE_A)).toBe(BASELINE_CORRECT);
    expect(BASELINE_CORRECT).toBe(22);
  });

  it("follow-up illustration reads 27 of 31 as written", () => {
    expect(FOLLOWUP_B).toHaveLength(31);
    expect(countCorrect(FOLLOWUP_B)).toBe(FOLLOWUP_CORRECT);
    expect(FOLLOWUP_CORRECT).toBe(27);
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

  it("example strip stays short enough to animate under 700ms", () => {
    // 250ms duration + 45ms stagger; tested bound, not timing.
    const totalMs = 250 + EXAMPLE_STRIP.length * 45;
    expect(totalMs).toBeLessThanOrEqual(700);
  });
});
