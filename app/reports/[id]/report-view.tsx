"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WordOutcome } from "@/lib/reading/align";
import { Trace } from "@/app/attempts/[id]/trace";

interface LookupEntry {
  target: string | null;
  observed: string | null;
  outcome: string;
  category: string | null;
  attemptLabel: string;
}

interface Props {
  learnerCode: string;
  investigationId: string;
  reportId: string;
  report: {
    concern_summary: string;
    observed_evidence: { statement: string; evidence: string[] }[];
    skill_patterns: { pattern: string; evidence: string[]; strength: string }[];
    patterns_worth_exploring: { description: string; basis: string[]; cautions: string }[];
    possible_explanations: { explanation: string; supports: string[]; would_weaken: string; confidence: string }[];
    alternative_explanations: string[];
    missing_information: string[];
    recommended_supports: { support_key: string; why: string; how_to_try: string; how_to_evaluate: string; addresses: string[] }[];
    referral_guidance: { consider_referral: string; rationale: string };
    follow_up_plan: { form: string; support_key: string; review_after_days: number; what_to_observe: string };
    limitations: string[];
    insufficient_evidence: boolean;
  };
  verificationPassed: boolean;
  reviewStatus: string;
  traces: { attemptLabel: string; records: WordOutcome[]; teacherEdited: boolean }[];
  lookup: Record<string, LookupEntry>;
  supportNames: Record<string, string>;
  resources: { id: string; title: string; publisher: string; practical_action: string; reason: string; url: string }[];
  runs: { kind: string; model: string; prompt_version: string | null; status: string }[];
}

function Chip({ id, lookup, onPick, selected }: { id: string; lookup: Record<string, LookupEntry>; onPick: (id: string) => void; selected: boolean }) {
  const entry = lookup[id];
  const label = entry
    ? `${id}: ${entry.target ?? "added word"}${entry.observed ? ` heard as ${entry.observed}` : ""}`
    : id;
  return (
    <button
      type="button"
      onClick={() => onPick(id)}
      title={label}
      aria-pressed={selected}
      className={`rounded border px-2 py-1 text-xs ${selected ? "border-pine bg-mist" : "border-rule bg-paper"}`}
    >
      {id}
    </button>
  );
}

export function ReportView(props: Props) {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { report } = props;

  async function review(status: "approved" | "rejected") {
    const res = await fetch(`/api/reports/${props.reportId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setToast("Could not save the review. Try again.");
      return;
    }
    setToast(status === "approved" ? "Report approved." : "Report rejected.");
    router.refresh();
  }

  return (
    <div>
      <p>
        <Link className="underline" href={`/investigations/${props.investigationId}`}>
          Back to investigation
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-3xl">
        Report for learner {props.learnerCode}{" "}
        <span className="text-lg">(Draft for your review)</span>
      </h1>
      <p className="mt-2 text-sm" role="status">
        {props.verificationPassed
          ? "Verified: every claim cites evidence that supports it."
          : "Report could not be verified. Treat it as a draft only."}{" "}
        Review: {props.reviewStatus.replace(/_/g, " ")}.
      </p>
      {report.insufficient_evidence ? (
        <p role="alert" className="mt-3 rounded border border-dusk p-3">
          There is not enough evidence yet for firm patterns. The suggestions
          below are low-risk starting points only.
        </p>
      ) : null}

      <section className="mt-6">
        <h2 className="font-serif text-2xl">What was recorded</h2>
        {report.observed_evidence.map((o, i) => (
          <div key={i} className="mt-2 border-t border-rule pt-2">
            <p>{o.statement}</p>
            <div className="mt-1 flex flex-wrap gap-1">
              {o.evidence.map((id) => (
                <Chip key={id} id={id} lookup={props.lookup} selected={selected === id} onPick={setSelected} />
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Patterns and other explanations</h2>
        {report.skill_patterns.map((s, i) => (
          <div key={i} className="mt-2 border-t border-rule pt-2">
            <p>
              {s.pattern} <span className="text-sm">(evidence: {s.strength})</span>
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {s.evidence.map((id) => (
                <Chip key={id} id={id} lookup={props.lookup} selected={selected === id} onPick={setSelected} />
              ))}
            </div>
          </div>
        ))}
        {report.patterns_worth_exploring.map((p, i) => (
          <div key={i} className="mt-2 border-t border-rule pt-2">
            <p>{p.description}</p>
            <p className="text-sm">Caution: {p.cautions}</p>
          </div>
        ))}
        {report.possible_explanations.map((e, i) => (
          <div key={i} className="mt-2 border-t border-rule pt-2">
            <p>
              {e.explanation} <span className="text-sm">(confidence: {e.confidence})</span>
            </p>
            <p className="text-sm">Would weaken this: {e.would_weaken}</p>
          </div>
        ))}
        <p className="mt-2 text-sm">Other explanations considered: {report.alternative_explanations.join("; ")}</p>
        <p className="mt-1 text-sm">Still needed: {report.missing_information.join("; ") || "nothing listed"}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">What to try</h2>
        {report.recommended_supports.map((s, i) => (
          <div key={i} className="mt-2 border-t border-rule pt-2">
            <p className="font-semibold">{props.supportNames[s.support_key] ?? s.support_key}</p>
            <p className="text-sm">Why: {s.why}</p>
            <p className="text-sm">How: {s.how_to_try}</p>
            <p className="text-sm">How to tell it helped: {s.how_to_evaluate}</p>
          </div>
        ))}
      </section>

      {props.resources.length > 0 ? (
        <section className="mt-6">
          <h2 className="font-serif text-2xl">Resources</h2>
          <ul className="mt-2 space-y-2">
            {props.resources.map((r) => (
              <li key={r.id} className="border-t border-rule pt-2 text-sm">
                <a className="underline" href={r.url ?? "#"} target="_blank" rel="noreferrer">
                  {r.title}
                </a>{" "}
                ({r.publisher}). {r.practical_action} Note: {r.reason}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6">
        <h2 className="font-serif text-2xl">When to seek more help</h2>
        <p>{report.referral_guidance.rationale}</p>
        <p className="mt-1 text-sm">
          Follow-up: Form {report.follow_up_plan.form} with{" "}
          {props.supportNames[report.follow_up_plan.support_key] ?? report.follow_up_plan.support_key},
          review after {report.follow_up_plan.review_after_days} days. Watch:{" "}
          {report.follow_up_plan.what_to_observe}
        </p>
        <ul className="mt-2 text-sm">
          {report.limitations.map((l, i) => (
            <li key={i}>Limit: {l}</li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="font-serif text-2xl">Evidence trace</h2>
        <p className="text-sm">Choose an evidence chip above to highlight the word below.</p>
        {props.traces.map((t) => (
          <div key={t.attemptLabel} className="mt-3">
            <h3 className="font-semibold">{t.attemptLabel}</h3>
            <Trace records={t.records} teacherEdited={t.teacherEdited} highlightId={selected} />
          </div>
        ))}
      </section>

      <section className="mt-6 border-t border-rule pt-4">
        <h2 className="font-serif text-2xl">Your review</h2>
        <div className="mt-2 flex gap-3">
          <button type="button" onClick={() => review("approved")} className="rounded bg-pine px-4 py-2 text-white">
            Approve report
          </button>
          <button type="button" onClick={() => review("rejected")} className="underline">
            Reject
          </button>
        </div>
        {toast ? (
          <p role="status" className="mt-2 text-sm">
            {toast}
          </p>
        ) : null}
        <p className="mt-3 text-sm">
          Model: {props.runs.find((r) => r.kind === "investigate")?.model ?? "unknown"}; prompts:
          investigator.v1, verifier.v1.
        </p>
      </section>
    </div>
  );
}
