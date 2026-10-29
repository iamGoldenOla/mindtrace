"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const SOURCES = ["teacher_report", "parent_report", "observed", "assessment"] as const;

export function ObservationForm({ learnerId }: { learnerId: string }) {
  const router = useRouter();
  const [behaviour, setBehaviour] = useState("");
  const [source, setSource] = useState<(typeof SOURCES)[number]>("observed");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch(`/api/learners/${learnerId}/observations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ behaviour: behaviour.trim(), source }),
    });
    if (!res.ok) {
      setMessage("Could not save the observation. Try again.");
      return;
    }
    setBehaviour("");
    setMessage("Observation saved.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-xl flex-col gap-3">
      <label className="flex flex-col gap-1">
        What did you observe, exactly as it happened
        <textarea
          value={behaviour}
          onChange={(e) => setBehaviour(e.target.value)}
          required
          maxLength={1000}
          rows={3}
          className="rounded border border-rule bg-paper px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Source
        <select
          value={source}
          onChange={(e) => setSource(e.target.value as (typeof SOURCES)[number])}
          className="w-fit rounded border border-rule bg-paper px-3 py-2"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="w-fit rounded bg-pine px-4 py-2 text-white">
        Save observation
      </button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
