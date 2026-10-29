import { getRepository } from "@/lib/db";
import { getEvidenceView } from "@/lib/reading/evidence-view";
import { Trace } from "./trace";
import { SaveEvidenceButton } from "./save-evidence-button";

const CATEGORY_LABELS: Record<string, string> = {
  visual_reversal: "visual reversal",
  vowel_substitution: "vowel sound changed",
  consonant_substitution: "consonant changed",
  ending_omission: "ending left off",
  onset_match_only: "first sound only",
  unrelated_word: "different word",
  other_substitution: "other change",
};

export async function EvidenceSection({ attemptId }: { attemptId: string }) {
  const repo = getRepository();
  const attempt = await repo.getAttempt(attemptId);
  if (!attempt) return null;
  const definition = await repo.getDefinition(attempt.definition_id);
  if (!definition) return null;
  const view = getEvidenceView(attempt, definition);
  if (!view) {
    return <p className="mt-2">Evidence appears once there is a transcript.</p>;
  }
  const m = view.metrics;
  const accuracy = m.accuracy === null ? "not available" : `${m.wordsCorrect} of ${m.wordsTotal} (${Math.round(m.accuracy * 100)}%)`;
  return (
    <div>
      <p className="mt-2">
        {accuracy} words read as written.
        {m.evidenceQuality !== "sufficient" ? ` Evidence quality: ${m.evidenceQuality}.` : ""}
        {view.teacherEdited ? ` Teacher corrected ${view.wordsEdited} word(s).` : ""}
      </p>
      {m.substitutions > 0 || m.omissions > 0 ? (
        <ul className="mt-2 text-sm">
          {Object.entries(m.categoryCounts)
            .filter(([, n]) => n > 0)
            .map(([cat, n]) => (
              <li key={cat}>
                {n} {CATEGORY_LABELS[cat] ?? cat}
              </li>
            ))}
          {m.omissions > 0 ? <li>{m.omissions} word(s) left out</li> : null}
          {m.insertions > 0 ? <li>{m.insertions} extra word(s) added</li> : null}
        </ul>
      ) : null}
      <div className="mt-4">
        <Trace records={view.records} teacherEdited={view.teacherEdited} />
      </div>
      <div className="mt-4">
        <SaveEvidenceButton attemptId={attemptId} stored={attempt.evidence_version !== null} />
      </div>
      <p className="mt-3 text-sm">
        These counts come from code, not from the AI. They are not a diagnosis
        or a score of ability.
      </p>
    </div>
  );
}
