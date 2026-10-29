import { describe, expect, it } from "vitest";
import { getEvidenceView } from "../lib/reading/evidence-view";
import type { AssessmentDefinition, Attempt } from "../lib/db/repository";

const FORM_A = "Sam has a red hat. The hat is on the bed. A dog sits on the mat by the shed. Then the dog digs in the sand and finds a shell.";

function wordsOf(passage: string): string[] {
  return passage.toLowerCase().replace(/[^a-z0-9'\s]/g, " ").split(/\s+/).filter(Boolean);
}

function attemptWith(transcript: string | null, extra?: Partial<Attempt>): Attempt {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    learner_id: "l-1",
    definition_id: "d-a",
    language: "en",
    condition: "baseline",
    support_strategy_id: null,
    status: "completed",
    asr_status: "ok",
    transcript,
    transcript_corrected: null,
    evidence_version: null,
    started_at: "2026-10-29T00:00:00.000Z",
    completed_at: "2026-10-29T00:01:00.000Z",
    created_by: "u-a",
    ...extra,
  };
}

const definition = {
  id: "d-a",
  slug: "read-aloud-a",
  name: "Form A",
  skill: "oral_reading",
  form: "A",
  language: "en",
  level: "early",
  instructions: {},
  scoring: {},
  target: { words: wordsOf(FORM_A), sentences: [FORM_A] },
  validation_status: "unvalidated",
  version: 1,
} as AssessmentDefinition;

describe("evidence view", () => {
  it("counts the hero pattern deterministically", () => {
    const view = getEvidenceView(
      attemptWith("Sam has a red hit. The hat is on the bed. A dog sits on the mat by the shed. Then the dog dig in the sand and finds a shell."),
      definition
    );
    expect(view?.metrics.wordsTotal).toBe(31);
    expect(view?.metrics.wordsCorrect).toBe(29);
    expect(view?.metrics.categoryCounts.vowel_substitution).toBe(1);
    expect(view?.metrics.categoryCounts.ending_omission).toBe(1);
    expect(view?.metrics.evidenceQuality).toBe("sufficient");
    expect(view?.records).toHaveLength(31);
  });

  it("marks empty transcripts insufficient", () => {
    const view = getEvidenceView(attemptWith("   ", { asr_status: "empty" }), definition);
    expect(view?.metrics.evidenceQuality).toBe("insufficient");
  });

  it("returns null without a transcript", () => {
    expect(getEvidenceView(attemptWith(null, { status: "in_progress" }), definition)).toBeNull();
  });

  it("uses the teacher correction when present", () => {
    const view = getEvidenceView(
      attemptWith("Sam has a red hit", { transcript_corrected: "Sam has a red hat" }),
      definition
    );
    expect(view?.teacherEdited).toBe(true);
    expect(view?.wordsEdited).toBe(1);
  });
});
