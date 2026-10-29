// Word-level alignment for the Read-Aloud Trace. Pure: no network, no LLM.
// See ASSESSMENT_SPEC.md sections 2.3-2.5.

export type Outcome = "match" | "substitution" | "omission" | "insertion";

export type ErrorCategory =
  | "visual_reversal"
  | "vowel_substitution"
  | "consonant_substitution"
  | "ending_omission"
  | "onset_match_only"
  | "unrelated_word"
  | "other_substitution";

export interface WordOutcome {
  index: number;
  target?: string;
  observed?: string;
  outcome: Outcome;
  category?: ErrorCategory;
  selfCorrected?: boolean;
  evidenceId: string;
}

const FILLERS = new Set(["um", "uh", "er"]);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function stripVowels(word: string): string {
  return word.replace(/[aeiou]/g, "");
}

function stripConsonants(word: string): string {
  return word.replace(/[^aeiou]/g, "");
}

function lev(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[m][n];
}

const REVERSAL_PAIRS = new Set(["b|d", "d|b", "p|q", "q|p", "was|saw", "saw|was", "on|no", "no|on"]);

function isReversal(target: string, observed: string): boolean {
  if (REVERSAL_PAIRS.has(`${target}|${observed}`)) return true;
  return (
    target.length > 1 &&
    target === observed.split("").reverse().join("")
  );
}

export function categorize(target: string, observed: string): ErrorCategory {
  if (isReversal(target, observed)) return "visual_reversal";
  if (
    stripVowels(target) === stripVowels(observed) &&
    stripConsonants(target) !== stripConsonants(observed)
  ) {
    return "vowel_substitution";
  }
  if (
    stripConsonants(target) === stripConsonants(observed) &&
    target.length === observed.length
  ) {
    return "consonant_substitution";
  }
  const stemEndings = ["s", "es", "ed", "ing"];
  for (const ending of stemEndings) {
    if (target === observed + ending) return "ending_omission";
  }
  if (
    target.startsWith(observed) &&
    target.length - observed.length <= 2 &&
    observed.length > 0
  ) {
    return "ending_omission";
  }
  if (
    target[0] === observed[0] &&
    target !== observed
  ) {
    return "onset_match_only";
  }
  if (lev(target, observed) > target.length / 2) return "unrelated_word";
  return "other_substitution";
}

export interface Alignment {
  records: WordOutcome[];
  hesitations: number;
  repetitions: number;
}

export function align(
  targetWords: string[],
  transcript: string,
  attemptShort: string
): Alignment {
  const tokens = tokenize(transcript);
  const hesitations = tokens.filter((t) => FILLERS.has(t)).length;
  const content = tokens.filter((t) => !FILLERS.has(t));

  // Collapse immediate repetitions of the same word.
  const observed: string[] = [];
  let repetitions = 0;
  for (const tok of content) {
    if (observed.length > 0 && observed[observed.length - 1] === tok) {
      repetitions++;
      continue;
    }
    observed.push(tok);
  }

  const m = targetWords.map((w) => w.toLowerCase()).length;
  const t = targetWords.map((w) => w.toLowerCase());
  const n = observed.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0
    )
  );
  const op: string[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => "")
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = t[i - 1] === observed[j - 1] ? 0 : 1;
      const sub = dp[i - 1][j - 1] + cost;
      const del = dp[i - 1][j] + 1;
      const ins = dp[i][j - 1] + 1;
      const best = Math.min(sub, del, ins);
      dp[i][j] = best;
      op[i][j] = best === sub ? (cost === 0 ? "match" : "sub") : best === del ? "del" : "ins";
    }
  }

  const records: WordOutcome[] = [];
  let i = m;
  let j = n;
  let insertions = 0;
  const rev: WordOutcome[] = [];
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && (op[i][j] === "match" || op[i][j] === "sub")) {
      const target = t[i - 1];
      const seen = observed[j - 1];
      if (op[i][j] === "match") {
        rev.push({
          index: i - 1,
          target,
          observed: seen,
          outcome: "match",
          evidenceId: `E-${attemptShort}-w${String(i - 1).padStart(2, "0")}`,
        });
      } else {
        rev.push({
          index: i - 1,
          target,
          observed: seen,
          outcome: "substitution",
          category: categorize(target, seen),
          evidenceId: `E-${attemptShort}-w${String(i - 1).padStart(2, "0")}`,
        });
      }
      i--;
      j--;
    } else if (i > 0 && (j === 0 || op[i][j] === "del")) {
      rev.push({
        index: i - 1,
        target: t[i - 1],
        outcome: "omission",
        evidenceId: `E-${attemptShort}-w${String(i - 1).padStart(2, "0")}`,
      });
      i--;
    } else {
      rev.push({
        index: -1,
        observed: observed[j - 1],
        outcome: "insertion",
        evidenceId: `E-${attemptShort}-i${String(insertions).padStart(2, "0")}`,
      });
      insertions++;
      j--;
    }
  }
  rev.reverse();
  // Renumber insertion ids in reading order.
  let insCount = 0;
  for (const r of rev) {
    if (r.outcome === "insertion") {
      r.evidenceId = `E-${attemptShort}-i${String(insCount).padStart(2, "0")}`;
      insCount++;
    }
    records.push(r);
  }
  return { records, hesitations, repetitions };
}
