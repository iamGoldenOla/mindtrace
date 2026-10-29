// Evidence records and summary metrics. Pure: no network, no LLM.
// See ASSESSMENT_SPEC.md sections 2.5-2.6.

import type { ErrorCategory, WordOutcome } from "./align";

export type EvidenceQuality = "sufficient" | "limited" | "insufficient";

export interface AttemptMetrics {
  wordsTotal: number;
  wordsCorrect: number;
  accuracy: number | null;
  substitutions: number;
  omissions: number;
  insertions: number;
  selfCorrections: number;
  repetitions: number;
  hesitationTokens: number;
  categoryCounts: Record<ErrorCategory, number>;
  longestCorrectRun: number;
  wordsPerMinute: null;
  transcriptCorrectedByTeacher: boolean;
  wordsEdited: number;
  evidenceQuality: EvidenceQuality;
}

const EMPTY_COUNTS: Record<ErrorCategory, number> = {
  visual_reversal: 0,
  vowel_substitution: 0,
  consonant_substitution: 0,
  ending_omission: 0,
  onset_match_only: 0,
  unrelated_word: 0,
  other_substitution: 0,
};

export function summarize(
  records: WordOutcome[],
  opts: {
    hesitations: number;
    repetitions: number;
    transcriptEmpty: boolean;
    asrFailed: boolean;
    transcriptCorrectedByTeacher?: boolean;
    wordsEdited?: number;
    targetAttempted?: number;
  }
): AttemptMetrics {
  const targetRecords = records.filter((r) => r.index >= 0);
  const wordsTotal = targetRecords.length;
  const matches = targetRecords.filter((r) => r.outcome === "match").length;
  const substitutions = targetRecords.filter(
    (r) => r.outcome === "substitution"
  ).length;
  const omissions = targetRecords.filter(
    (r) => r.outcome === "omission"
  ).length;
  const insertions = records.filter((r) => r.outcome === "insertion").length;
  const categoryCounts: Record<ErrorCategory, number> = { ...EMPTY_COUNTS };
  for (const r of targetRecords) {
    if (r.outcome === "substitution" && r.category) {
      categoryCounts[r.category]++;
    }
  }
  let longest = 0;
  let run = 0;
  for (const r of targetRecords) {
    if (r.outcome === "match") {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  const wordsEdited = opts.wordsEdited ?? 0;
  const attempted = opts.targetAttempted ?? wordsTotal - omissions;
  let evidenceQuality: EvidenceQuality = "sufficient";
  if (
    opts.transcriptEmpty ||
    opts.asrFailed ||
    (wordsTotal > 0 && wordsEdited / wordsTotal > 0.3)
  ) {
    evidenceQuality = "insufficient";
  } else if (attempted < 20) {
    evidenceQuality = "limited";
  }
  return {
    wordsTotal,
    wordsCorrect: matches,
    accuracy: wordsTotal > 0 ? matches / wordsTotal : null,
    substitutions,
    omissions,
    insertions,
    selfCorrections: 0,
    repetitions: opts.repetitions,
    hesitationTokens: opts.hesitations,
    categoryCounts,
    longestCorrectRun: longest,
    wordsPerMinute: null,
    transcriptCorrectedByTeacher: opts.transcriptCorrectedByTeacher ?? false,
    wordsEdited,
    evidenceQuality,
  };
}
