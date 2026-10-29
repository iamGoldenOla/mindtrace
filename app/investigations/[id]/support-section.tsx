import { getRepository } from "@/lib/db";
import supportsCatalog from "@/content/supports.json";
import { StrategyForms } from "./support-forms";

interface ComparisonView {
  comparable: boolean;
  reasons_not_comparable: string[];
  direction: string;
  sentence: string;
  caveats: string[];
}

export async function SupportSection({
  investigationId,
  learnerId,
}: {
  investigationId: string;
  learnerId: string;
}) {
  const repo = getRepository();
  const strategies = await repo.listStrategiesByInvestigation(investigationId);
  const attempts = await repo.listAttemptsByLearner(learnerId);
  const catalog = (supportsCatalog as { supports: { key: string; name: string; description: string }[] }).supports;
  const names: Record<string, string> = {};
  for (const s of catalog) names[s.key] = s.name;

  const detailed = [];
  for (const s of strategies) {
    const followups = await repo.listFollowupsByStrategy(s.id);
    detailed.push({
      strategy: s,
      name: names[s.catalog_key] ?? s.catalog_key,
      followups: followups.map((f) => ({
        id: f.id,
        baseline_attempt_id: f.baseline_attempt_id,
        followup_attempt_id: f.followup_attempt_id,
        comparison: f.comparison as unknown as ComparisonView | null,
        teacher_notes: f.teacher_notes,
        decision: f.decision,
      })),
    });
  }

  return (
    <div>
      <h2 className="mt-8 font-serif text-2xl">Support plan</h2>
      {detailed.length === 0 ? (
        <p className="mt-2">No support chosen yet.</p>
      ) : (
        detailed.map((d) => (
          <div key={d.strategy.id} className="mt-4 border-t border-rule pt-3">
            <p className="font-semibold">{d.name}</p>
            <p className="text-sm">
              Started {d.strategy.start_date}; status: {d.strategy.status}.
              {d.strategy.rationale ? ` Reason: ${d.strategy.rationale}` : ""}
            </p>
            {d.followups.map((f) => (
              <div key={f.id} className="mt-3 rounded bg-paper p-4">
                <ComparisonBlock
                  followupId={f.id}
                  comparison={f.comparison}
                  decision={f.decision}
                  notes={f.teacher_notes}
                />
              </div>
            ))}
          </div>
        ))
      )}
      <StrategyForms
        investigationId={investigationId}
        catalog={catalog.map((s) => ({ key: s.key, name: s.name }))}
        strategies={detailed.map((d) => ({ id: d.strategy.id, name: d.name }))}
        attempts={attempts
          .filter((a) => a.status === "completed")
          .map((a) => ({ id: a.id, label: `${a.condition}, started ${a.started_at.slice(0, 10)}` }))}
        followupsNeedingAttempt={detailed.flatMap((d) =>
          d.followups.filter((f) => !f.followup_attempt_id).map((f) => ({ id: f.id, strategyName: d.name }))
        )}
      />
    </div>
  );
}

function ComparisonBlock({
  followupId,
  comparison,
  decision,
  notes,
}: {
  followupId: string;
  comparison: ComparisonView | null;
  decision: string | null;
  notes: string | null;
}) {
  void followupId;
  if (!comparison) {
    return <p className="text-sm">Follow-up assigned. Link the follow-up reading below to compare.</p>;
  }
  const directionLabel =
    comparison.direction === "improved"
      ? "Improved"
      : comparison.direction === "declined"
        ? "Declined"
        : "No clear change";
  return (
    <div>
      {!comparison.comparable ? (
        <p role="alert" className="text-sm">
          Not comparable: {comparison.reasons_not_comparable.join(" ")}
        </p>
      ) : null}
      <p>{comparison.sentence}</p>
      <p className="mt-1 text-sm">Direction: {directionLabel}.</p>
      <ul className="mt-1 text-sm">
        {comparison.caveats.map((c, i) => (
          <li key={i}>Note: {c}</li>
        ))}
      </ul>
      <p className="mt-2 text-sm">
        Decision: {decision ?? "not recorded yet"}
        {notes ? `; notes: ${notes}` : ""}
      </p>
    </div>
  );
}
