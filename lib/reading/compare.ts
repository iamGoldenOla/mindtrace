// Matched before/after comparison. Pure: no network, no LLM.
// See ASSESSMENT_SPEC.md section 2.7.

import type { AttemptMetrics } from "./evidence";
import type { ErrorCategory } from "./align";

export type Direction = "improved" | "no_clear_change" | "declined";

export interface Comparison {
  comparable: boolean;
  reasonsNotComparable: string[];
  baseline: AttemptMetrics;
  followup: AttemptMetrics;
  delta: {
    accuracy: number | null;
    substitutions: number;
    omissions: number;
    byCategory: Record<ErrorCategory, number>;
  };
  direction: Direction;
  caveats: string[];
}

const BASE_CAVEATS = [
  "Based on a single attempt each; forms are matched by design, not validated as equal.",
  "Other factors (tiredness, device, instructions) may differ between attempts.",
];

export function compare(
  baseline: AttemptMetrics,
  followup: AttemptMetrics,
  sameActivity: boolean,
  differentForm: boolean
): Comparison {
  const reasonsNotComparable: string[] = [];
  if (!sameActivity) reasonsNotComparable.push("Different activity.");
  if (!differentForm) reasonsNotComparable.push("Same passage form reused.");
  if (
    baseline.evidenceQuality === "insufficient" ||
    followup.evidenceQuality === "insufficient"
  ) {
    reasonsNotComparable.push("One attempt has insufficient evidence.");
  }
  const comparable = reasonsNotComparable.length === 0;

  const deltaAccuracy =
    baseline.accuracy !== null && followup.accuracy !== null
      ? followup.accuracy - baseline.accuracy
      : null;
  const byCategory = {} as Record<ErrorCategory, number>;
  for (const key of Object.keys(baseline.categoryCounts) as ErrorCategory[]) {
    byCategory[key] = followup.categoryCounts[key] - baseline.categoryCounts[key];
  }
  const delta = {
    accuracy: deltaAccuracy,
    substitutions: followup.substitutions - baseline.substitutions,
    omissions: followup.omissions - baseline.omissions,
    byCategory,
  };

  // Conservative placeholder rule: >= 3 words of 31 shift, categories not worse.
  const wordShift =
    deltaAccuracy !== null ? deltaAccuracy * baseline.wordsTotal : 0;
  const categoriesWorse = Object.values(byCategory).some((d) => d > 0);
  const categoriesBetter = Object.values(byCategory).some((d) => d < 0);
  let direction: Direction = "no_clear_change";
  if (wordShift >= 3 && !categoriesWorse) direction = "improved";
  else if (wordShift <= -3 && !categoriesBetter) direction = "declined";

  return {
    comparable,
    reasonsNotComparable,
    baseline,
    followup,
    delta,
    direction,
    caveats: BASE_CAVEATS,
  };
}

export function comparisonSentence(
  support: string,
  baseline: AttemptMetrics,
  followup: AttemptMetrics
): string {
  const before = `${baseline.wordsCorrect} of ${baseline.wordsTotal}`;
  const after = `${followup.wordsCorrect} of ${followup.wordsTotal}`;
  return (
    `After ${support}, ${after} words were read as written, ` +
    `up from ${before} on a comparable passage. ` +
    `This does not show that ${support} caused the change.`
  );
}
