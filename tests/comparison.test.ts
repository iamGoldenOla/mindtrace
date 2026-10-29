import { describe, expect, it } from "vitest";
import { compare, comparisonSentence } from "../lib/reading/compare";
import type { AttemptMetrics } from "../lib/reading/evidence";
import type { ErrorCategory } from "../lib/reading/align";

const CATS: Record<ErrorCategory, number> = {
  visual_reversal: 0,
  vowel_substitution: 0,
  consonant_substitution: 0,
  ending_omission: 0,
  onset_match_only: 0,
  unrelated_word: 0,
  other_substitution: 0,
};

function metrics(correct: number, subs: number): AttemptMetrics {
  return {
    wordsTotal: 31,
    wordsCorrect: correct,
    accuracy: correct / 31,
    substitutions: subs,
    omissions: 0,
    insertions: 0,
    selfCorrections: 0,
    repetitions: 0,
    hesitationTokens: 0,
    categoryCounts: { ...CATS, vowel_substitution: subs },
    longestCorrectRun: correct,
    wordsPerMinute: null,
    transcriptCorrectedByTeacher: false,
    wordsEdited: 0,
    evidenceQuality: "sufficient",
  };
}

describe("comparison", () => {
  it("reports improved only on a clear shift without new errors", () => {
    const out = compare(metrics(22, 6), metrics(27, 1), true, true);
    expect(out.comparable).toBe(true);
    expect(out.direction).toBe("improved");
  });

  it("reports no clear change honestly", () => {
    const out = compare(metrics(22, 6), metrics(23, 6), true, true);
    expect(out.direction).toBe("no_clear_change");
  });

  it("refuses comparison on the same form", () => {
    const out = compare(metrics(22, 6), metrics(27, 1), true, false);
    expect(out.comparable).toBe(false);
    expect(out.reasonsNotComparable.length).toBeGreaterThan(0);
  });

  it("uses careful wording that never claims cause", () => {
    const sentence = comparisonSentence("chunked text", metrics(22, 6), metrics(27, 1));
    expect(sentence).toContain("27 of 31");
    expect(sentence).toContain("up from 22 of 31");
    expect(sentence).toContain("does not show that");
    expect(sentence).not.toMatch(/because|proves|caused an improvement|shows that .* helped/i);
  });
});
