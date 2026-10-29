// Evidence computed from an attempt with the deterministic engine.
// Pure: no network, no LLM. Used by the evidence route and the attempt page.
import { align, tokenize, type WordOutcome } from "./align";
import { summarize, type AttemptMetrics } from "./evidence";
import type { AssessmentDefinition, Attempt } from "@/lib/db/repository";

export interface EvidenceView {
  records: WordOutcome[];
  metrics: AttemptMetrics;
  effectiveTranscript: string;
  teacherEdited: boolean;
  wordsEdited: number;
}

export function countEditedWords(original: string, corrected: string): number {
  const a = tokenize(original);
  const b = tokenize(corrected);
  const shared = Math.min(a.length, b.length);
  let same = 0;
  for (let i = 0; i < shared; i++) {
    if (a[i] === b[i]) same++;
  }
  return Math.max(a.length, b.length) - same;
}

export function getEvidenceView(attempt: Attempt, definition: AssessmentDefinition): EvidenceView | null {
  const original = attempt.transcript;
  if (original === null) return null;
  const corrected = attempt.transcript_corrected;
  const effective = corrected ?? original;
  const teacherEdited = corrected !== null;
  const wordsEdited = teacherEdited ? countEditedWords(original, corrected as string) : 0;
  const short = attempt.id.replace(/-/g, "").slice(0, 4);
  const { records, hesitations, repetitions } = align(definition.target.words, effective, short);
  const metrics = summarize(records, {
    hesitations,
    repetitions,
    transcriptEmpty: effective.trim().length === 0,
    asrFailed: attempt.asr_status === "failed",
    transcriptCorrectedByTeacher: teacherEdited,
    wordsEdited,
    targetAttempted: records.filter((r) => r.index >= 0 && r.outcome !== "omission").length,
  });
  return { records, metrics, effectiveTranscript: effective, teacherEdited, wordsEdited };
}
