"use client";

import { useState } from "react";
import type { WordOutcome } from "@/lib/reading/align";

function barClass(outcome: WordOutcome["outcome"], edited: boolean): string {
  if (edited) return "border-t-2 border-dashed border-dusk";
  switch (outcome) {
    case "match":
      return "border-t-4 border-pine";
    case "substitution":
      return "border-t-4 border-marigold";
    case "omission":
      return "border-t-4 border-madder";
    case "insertion":
      return "border-t-2 border-dusk";
  }
}

function accessibleName(r: WordOutcome, position: number): string {
  const bits = [`Word ${position + 1}`];
  if (r.target) bits.push(`target ${r.target}`);
  if (r.observed) bits.push(`heard ${r.observed}`);
  bits.push(r.outcome);
  if (r.category) bits.push(r.category.replace(/_/g, " "));
  bits.push(r.evidenceId);
  return bits.join(", ");
}

export function Trace({
  records,
  teacherEdited,
  highlightId,
}: {
  records: WordOutcome[];
  teacherEdited: boolean;
  highlightId?: string | null;
}) {
  const [tableView, setTableView] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const active = highlightId ?? selected;
  const words = records.filter((r) => r.index >= 0);
  const insertions = records.filter((r) => r.index < 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setTableView((v) => !v)}
        className="text-sm underline"
        aria-pressed={tableView}
      >
        {tableView ? "Show as trace" : "Show as table"}
      </button>
      {!tableView ? (
        <div className="mt-3 flex flex-wrap gap-x-1 gap-y-4" role="list" aria-label="Word-by-word trace">
          {words.map((r, i) => {
            const isActive = active === r.evidenceId;
            return (
              <button
                key={r.evidenceId}
                type="button"
                role="listitem"
                aria-label={accessibleName(r, i)}
                title={`${r.evidenceId}${r.observed ? `: heard ${r.observed}` : ""}${r.category ? ` (${r.category.replace(/_/g, " ")})` : ""}`}
                onClick={() => setSelected(isActive ? null : r.evidenceId)}
                data-active={isActive ? "true" : "false"}
                className={`group min-w-[44px] min-h-[44px] px-1 pb-1 text-left ${barClass(r.outcome, teacherEdited)} ${
                  isActive ? "bg-mist" : ""
                }`}
              >
                {r.outcome === "substitution" && r.observed ? (
                  <span className="block text-xs text-madder">〈{r.observed}〉</span>
                ) : null}
                <span className={r.outcome === "omission" ? "line-through opacity-70" : ""}>
                  {r.target}
                </span>
                <span className="trace-id block text-xs text-ink">{r.evidenceId}</span>
              </button>
            );
          })}
          {insertions.map((r) => (
            <span key={r.evidenceId} className="text-dusk" title={`${r.evidenceId}: added ${r.observed ?? ""}`}>
              +{r.observed}
            </span>
          ))}
        </div>
      ) : (
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="text-left">Word-by-word outcomes</caption>
          <thead>
            <tr className="border-b border-rule text-left">
              <th scope="col" className="py-1 pr-2">Evidence</th>
              <th scope="col" className="py-1 pr-2">Target</th>
              <th scope="col" className="py-1 pr-2">Heard</th>
              <th scope="col" className="py-1 pr-2">Outcome</th>
              <th scope="col" className="py-1">Category</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.evidenceId} className="border-b border-rule">
                <td className="py-1 pr-2">{r.evidenceId}</td>
                <td className="py-1 pr-2">{r.target ?? "—"}</td>
                <td className="py-1 pr-2">{r.observed ?? "—"}</td>
                <td className="py-1 pr-2">{r.outcome}</td>
                <td className="py-1">{r.category?.replace(/_/g, " ") ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {teacherEdited ? (
        <p className="mt-2 text-sm text-dusk">Dashed bars: the teacher corrected this transcript.</p>
      ) : null}
    </div>
  );
}
