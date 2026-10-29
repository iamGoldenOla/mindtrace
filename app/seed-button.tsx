"use client";

import { useState } from "react";

export function SeedButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function seed() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      if (!res.ok) {
        setMessage("Already seeded, or sign in first. Go to Sign in.");
        return;
      }
      const data = (await res.json()) as { counts?: { learners?: number } };
      setMessage(
        `Demo data ready (${data.counts?.learners ?? 4} learners). Now choose a teacher on the sign-in page.`
      );
    } catch {
      setMessage("Seeding failed. Is the dev server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={seed}
        disabled={busy}
        className="rounded border border-pine px-4 py-2 text-pine disabled:opacity-60"
      >
        {busy ? "Seeding" : "Seed demo data"}
      </button>
      {message ? (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}
