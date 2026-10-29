// Deterministic language filters (run before and after the model verifier)
// plus the model verifier call itself. Any hit fails the report.
import { chat } from "./provider";

const CONDITION_WORDS = [
  "dyslexia", "dyslexic", "adhd", "add\\b", "autism", "autistic",
  "dyscalculia", "dyspraxia", "dysgraphia",
];

const PROBABILITY_PATTERNS = [
  /\d+\s*%/, /\b\d+\s*percent\b/i, /\blikely\s+(has|is|to be)\b/i,
  /\bprobably\s+(has|is|dyslexic)\b/i, /\bat\s+risk\b/i, /\bhigh\s+risk\b/i,
  /\brisk\s+score\b/i, /\b\d+\s*in\s*\d+\s*chance\b/i,
];

const TREATMENT_WORDS = ["medication", "prescrib", "therapy plan", "cure", "treat him", "treat her", "treat them"];

const STIGMA_PHRASES = ["lazy", "defective", "low ability", "slow learner", "stupid"];

export interface FilterHit {
  path: string;
  phrase: string;
}

function collectStrings(value: unknown, path: string, out: { path: string; text: string }[]): void {
  if (typeof value === "string") {
    out.push({ path, text: value });
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => collectStrings(v, `${path}[${i}]`, out));
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) collectStrings(v, path ? `${path}.${k}` : k, out);
  }
}

export function deterministicFilter(report: Record<string, unknown>): FilterHit[] {
  const hits: FilterHit[] = [];
  const strings: { path: string; text: string }[] = [];
  collectStrings(report, "", strings);
  const conditionRe = new RegExp(`\\b(${CONDITION_WORDS.join("|")})`, "i");
  for (const { path, text } of strings) {
    const inReferralRationale = path.startsWith("referral_guidance.rationale");
    if (!inReferralRationale && conditionRe.test(text)) {
      hits.push({ path, phrase: "condition named as a finding" });
    }
    for (const re of PROBABILITY_PATTERNS) {
      if (re.test(text)) {
        hits.push({ path, phrase: "probability or risk level" });
        break;
      }
    }
    const lower = text.toLowerCase();
    for (const w of TREATMENT_WORDS) {
      if (lower.includes(w)) {
        hits.push({ path, phrase: `treatment advice (${w})` });
        break;
      }
    }
    for (const s of STIGMA_PHRASES) {
      if (lower.includes(s)) {
        hits.push({ path, phrase: `stigmatising language (${s})` });
        break;
      }
    }
  }
  return hits;
}

const VERIFIER_PROMPT = `You are a strict reviewer. You receive (1) the evidence records, (2) a draft report. For each statement in the report, decide whether the cited evidence IDs actually support it.

Return JSON: { "passed": boolean, "unsupported_claims": [{ "path": string, "reason": string }], "banned_language": [{ "path": string, "phrase": string }], "overreach": [{ "path": string, "reason": string }] }

Fail the report if any claim is unsupported, any evidence ID is missing, any condition is named as a finding about the learner, any probability or risk level appears, any treatment or medication advice appears, or any stigmatising language appears. Do not rewrite the report.`;

export interface VerifierResult {
  passed: boolean;
  unsupported_claims: { path: string; reason: string }[];
  banned_language: { path: string; phrase: string }[];
  overreach: { path: string; reason: string }[];
}

function extractJson(text: string): unknown {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("No JSON object in model output.");
  return JSON.parse(text.slice(start, end + 1));
}

export async function runVerifier(
  evidence: Record<string, unknown>,
  draft: Record<string, unknown>
): Promise<{ result: VerifierResult; latencyMs: number }> {
  const started = Date.now();
  const first = await chat({
    messages: [
      { role: "system", content: VERIFIER_PROMPT },
      { role: "user", content: JSON.stringify({ evidence, draft }) },
    ],
  });
  try {
    const parsed = extractJson(first.text) as VerifierResult;
    if (typeof parsed.passed !== "boolean") throw new Error("Bad verifier shape.");
    return { result: parsed, latencyMs: Date.now() - started };
  } catch {
    const repair = await chat({
      messages: [
        { role: "system", content: VERIFIER_PROMPT },
        { role: "user", content: JSON.stringify({ evidence, draft }) },
        {
          role: "user",
          content: "Your last reply was not valid JSON. Reply with only the JSON object described above.",
        },
      ],
    });
    const parsed = extractJson(repair.text) as VerifierResult;
    if (typeof parsed.passed !== "boolean") throw new Error("Verifier returned invalid JSON twice.");
    return { result: parsed, latencyMs: Date.now() - started };
  }
}
