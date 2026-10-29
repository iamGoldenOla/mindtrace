"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConcernForm({ learnerId }: { learnerId: string }) {
  const router = useRouter();
  const [concern, setConcern] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/investigations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ learner_id: learnerId, concern: concern.trim() }),
    });
    if (!res.ok) {
      setMessage("Could not save the concern. Try again.");
      return;
    }
    setConcern("");
    setMessage("Concern saved. An investigation is open.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-xl flex-col gap-3">
      <label className="flex flex-col gap-1">
        Concern in one or two sentences. Do not name a condition.
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          required
          maxLength={1000}
          rows={2}
          className="rounded border border-rule bg-paper px-3 py-2"
        />
      </label>
      <button type="submit" className="w-fit rounded bg-pine px-4 py-2 text-white">
        Save concern
      </button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
