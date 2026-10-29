"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const DECISIONS = ["continue", "change", "review", "refer"] as const;

export function StrategyForms({
  investigationId,
  catalog,
  strategies,
  attempts,
  followupsNeedingAttempt,
}: {
  investigationId: string;
  catalog: { key: string; name: string }[];
  strategies: { id: string; name: string }[];
  attempts: { id: string; label: string }[];
  followupsNeedingAttempt: { id: string; strategyName: string }[];
}) {
  const router = useRouter();
  const [supportKey, setSupportKey] = useState(catalog[0]?.key ?? "");
  const [rationale, setRationale] = useState("");
  const [strategyId, setStrategyId] = useState("");
  const [baselineId, setBaselineId] = useState("");
  const [linkFollowupId, setLinkFollowupId] = useState("");
  const [linkAttemptId, setLinkAttemptId] = useState("");
  const [decisionId, setDecisionId] = useState("");
  const [decision, setDecision] = useState<(typeof DECISIONS)[number]>("review");
  const [message, setMessage] = useState<string | null>(null);

  async function post(url: string, body: unknown) {
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function saveStrategy() {
    setMessage(null);
    const res = await post("/api/strategies", {
      investigation_id: investigationId,
      catalog_key: supportKey,
      rationale: rationale.trim() || undefined,
    });
    setMessage(res.ok ? "Support plan saved." : "Could not save the support plan.");
    router.refresh();
  }

  async function assignFollowup() {
    if (!strategyId || !baselineId) {
      setMessage("Choose a support and a baseline reading.");
      return;
    }
    setMessage(null);
    const res = await post("/api/followups", {
      support_strategy_id: strategyId,
      baseline_attempt_id: baselineId,
    });
    setMessage(res.ok ? "Follow-up assigned. Run the matched reading next." : "Could not assign the follow-up.");
    router.refresh();
  }

  async function linkAttempt() {
    if (!linkFollowupId || !linkAttemptId) {
      setMessage("Choose a follow-up and the reading to link.");
      return;
    }
    setMessage(null);
    const res = await fetch(`/api/followups/${linkFollowupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ followup_attempt_id: linkAttemptId }),
    });
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setMessage(res.ok ? "Comparison computed." : (data?.error ?? "Could not compute the comparison."));
    router.refresh();
  }

  async function saveDecision() {
    if (!decisionId) {
      setMessage("Choose a follow-up first.");
      return;
    }
    setMessage(null);
    const res = await fetch(`/api/followups/${decisionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision }),
    });
    setMessage(res.ok ? "Decision recorded." : "Could not record the decision.");
    router.refresh();
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex max-w-xl flex-col gap-2">
        <h3 className="font-semibold">Choose a support</h3>
        <label className="flex flex-col gap-1">
          Support
          <select value={supportKey} onChange={(e) => setSupportKey(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
            {catalog.map((s) => (
              <option key={s.key} value={s.key}>{s.name}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Reason (optional)
          <input value={rationale} onChange={(e) => setRationale(e.target.value)} maxLength={500} className="rounded border border-rule bg-paper px-3 py-2" />
        </label>
        <button type="button" onClick={saveStrategy} className="w-fit rounded bg-pine px-4 py-2 text-white">
          Save support plan
        </button>
      </div>

      {strategies.length > 0 && attempts.length > 0 ? (
        <div className="flex max-w-xl flex-col gap-2">
          <h3 className="font-semibold">Assign a matched follow-up</h3>
          <label className="flex flex-col gap-1">
            Support
            <select value={strategyId} onChange={(e) => setStrategyId(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
              <option value="">Choose</option>
              {strategies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Baseline reading
            <select value={baselineId} onChange={(e) => setBaselineId(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
              <option value="">Choose</option>
              {attempts.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={assignFollowup} className="w-fit rounded bg-pine px-4 py-2 text-white">
            Assign follow-up
          </button>
        </div>
      ) : null}

      {followupsNeedingAttempt.length > 0 ? (
        <div className="flex max-w-xl flex-col gap-2">
          <h3 className="font-semibold">Link the follow-up reading and compare</h3>
          <label className="flex flex-col gap-1">
            Follow-up
            <select value={linkFollowupId} onChange={(e) => setLinkFollowupId(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
              <option value="">Choose</option>
              {followupsNeedingAttempt.map((f) => (
                <option key={f.id} value={f.id}>{f.strategyName}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Follow-up reading (different form)
            <select value={linkAttemptId} onChange={(e) => setLinkAttemptId(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
              <option value="">Choose</option>
              {attempts.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={linkAttempt} className="w-fit rounded bg-pine px-4 py-2 text-white">
            Compare results
          </button>
        </div>
      ) : null}

      <div className="flex max-w-xl flex-col gap-2">
        <h3 className="font-semibold">Record a decision</h3>
        <label className="flex flex-col gap-1">
          Decision: continue, change, review, or refer
          <select value={decision} onChange={(e) => setDecision(e.target.value as (typeof DECISIONS)[number])} className="rounded border border-rule bg-paper px-3 py-2">
            {DECISIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Apply to follow-up (optional: leave empty to skip)
          <select value={decisionId} onChange={(e) => setDecisionId(e.target.value)} className="rounded border border-rule bg-paper px-3 py-2">
            <option value="">Choose</option>
            {followupsNeedingAttempt.map((f) => (
              <option key={f.id} value={f.id}>{f.strategyName}</option>
            ))}
          </select>
        </label>
        <button type="button" onClick={saveDecision} className="w-fit rounded bg-pine px-4 py-2 text-white">
          Save decision
        </button>
      </div>
      {message ? <p role="status" className="text-sm">{message}</p> : null}
    </div>
  );
}
