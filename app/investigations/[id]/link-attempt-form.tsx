"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface AttemptOption {
  id: string;
  condition: string;
  status: string;
  started_at: string;
}

export function LinkAttemptForm({
  investigationId,
  unlinkedAttempts,
}: {
  investigationId: string;
  unlinkedAttempts: AttemptOption[];
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(unlinkedAttempts[0]?.id ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (unlinkedAttempts.length === 0) return null;

  async function linkAttempt() {
    if (!selectedId) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/investigations/${investigationId}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attempt_id: selectedId }),
      });
      if (!res.ok) {
        setMessage("Could not link attempt. Try again.");
        return;
      }
      setMessage("Attempt linked.");
      router.refresh();
    } catch {
      setMessage("Could not link attempt. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 rounded border border-rule bg-paper p-4">
      <h3 className="font-semibold text-sm">Link an existing reading attempt</h3>
      <p className="mt-1 text-xs text-ink/70">
        Attach a recorded reading attempt from this learner to include its Trace in the investigation.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="rounded border border-rule bg-paper px-3 py-2 text-sm"
          disabled={busy}
        >
          {unlinkedAttempts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.condition} ({a.status}) — {a.started_at.slice(0, 10)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={linkAttempt}
          disabled={busy || !selectedId}
          className="rounded bg-pine px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {busy ? "Linking..." : "Link to investigation"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs text-pine">{message}</p> : null}
    </div>
  );
}

