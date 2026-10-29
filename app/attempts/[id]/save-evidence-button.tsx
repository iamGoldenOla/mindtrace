"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SaveEvidenceButton({ attemptId, stored }: { attemptId: string; stored: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMessage(null);
    const res = await fetch(`/api/attempts/${attemptId}/evidence`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      setMessage("Could not store the evidence. Try again.");
      return;
    }
    setMessage("Evidence stored.");
    router.refresh();
  }

  return (
    <div>
      <button
        type="button"
        onClick={save}
        disabled={busy}
        className="rounded bg-pine px-4 py-2 text-white disabled:opacity-60"
      >
        {stored ? "Recompute and store evidence" : "Compute and store evidence"}
      </button>
      {message ? (
        <p role="status" className="mt-1 text-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}
