"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CorrectionForm({ attemptId, initial }: { attemptId: string; initial: string }) {
  const router = useRouter();
  const [text, setText] = useState(initial);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch(`/api/attempts/${attemptId}/transcript`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript: text.trim() }),
    });
    if (!res.ok) {
      setMessage("Could not save the correction. Try again.");
      return;
    }
    setMessage("Correction saved.");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-3 flex max-w-xl flex-col gap-3">
      <label className="flex flex-col gap-1">
        Corrected transcript
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          rows={4}
          className="rounded border border-rule bg-paper px-3 py-2"
        />
      </label>
      <button type="submit" className="w-fit rounded bg-pine px-4 py-2 text-white">
        Save correction
      </button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
