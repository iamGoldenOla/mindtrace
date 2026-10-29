import Link from "next/link";
import { getRepository } from "@/lib/db";

interface Event {
  date: string;
  kind: string;
  label: string;
  href?: string;
}

export async function Timeline({ learnerId }: { learnerId: string }) {
  const repo = getRepository();
  const events: Event[] = [];
  for (const o of await repo.listObservations(learnerId)) {
    events.push({
      date: o.observed_on,
      kind: "Observation",
      label: `${o.category ?? "general"} (${o.source}): ${o.behaviour.slice(0, 80)}`,
    });
  }
  for (const a of await repo.listAttemptsByLearner(learnerId)) {
    events.push({
      date: a.started_at.slice(0, 10),
      kind: "Reading",
      label: `${a.condition} reading, ${a.status}`,
      href: `/attempts/${a.id}`,
    });
  }
  for (const inv of await repo.listInvestigationsByLearner(learnerId)) {
    events.push({
      date: inv.created_at.slice(0, 10),
      kind: "Investigation",
      label: `${inv.status}: ${inv.concern.slice(0, 80)}`,
      href: `/investigations/${inv.id}`,
    });
    for (const r of await repo.listReportsByInvestigation(inv.id)) {
      const v = r.verification as { passed?: boolean };
      events.push({
        date: r.created_at.slice(0, 10),
        kind: "Report",
        label: v.passed ? "Verified report" : "Unverified report draft",
        href: `/reports/${r.id}`,
      });
    }
    for (const s of await repo.listStrategiesByInvestigation(inv.id)) {
      events.push({
        date: s.start_date,
        kind: "Support",
        label: `${s.catalog_key} (${s.status})`,
      });
      for (const f of await repo.listFollowupsByStrategy(s.id)) {
        if (f.decision) {
          events.push({
            date: f.created_at.slice(0, 10),
            kind: "Decision",
            label: `Follow-up decision: ${f.decision}`,
          });
        }
      }
    }
  }
  events.sort((a, b) => (a.date < b.date ? 1 : -1));

  if (events.length === 0) {
    return <p className="mt-2">Nothing recorded yet.</p>;
  }
  return (
    <ol className="mt-3 space-y-3">
      {events.map((e, i) => (
        <li key={`${e.date}-${e.kind}-${i}`} className="border-t border-rule pt-2 text-sm">
          <span className="font-semibold">{e.kind}</span> <span>{e.date}</span>
          <p>
            {e.href ? <Link className="underline" href={e.href}>{e.label}</Link> : e.label}
          </p>
        </li>
      ))}
    </ol>
  );
}
