"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewLearnerForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [stage, setStage] = useState("Year 2");
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const res = await fetch("/api/learners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: code.trim(), stage: stage.trim() || undefined }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setMessage(data?.error ?? "Could not add the learner.");
      return;
    }
    setCode("");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4 flex max-w-md flex-col gap-3">
      <label className="flex flex-col gap-1">
        Learner code
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
          maxLength={24}
          placeholder="L-0005"
          className="rounded border border-rule bg-paper px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        Stage
        <input
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          maxLength={40}
          className="rounded border border-rule bg-paper px-3 py-2"
        />
      </label>
      <button type="submit" className="w-fit rounded bg-pine px-4 py-2 text-white">
        Add learner
      </button>
      {message ? (
        <p role="status" className="text-sm">
          {message}
        </p>
      ) : null}
    </form>
  );
}
