"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteLearnerButton({ learnerId, code }: { learnerId: string; code: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  async function remove() {
    const res = await fetch(`/api/learners/${learnerId}`, { method: "DELETE" });
    if (!res.ok) return;
    router.push("/learners");
    router.refresh();
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded border border-madder px-4 py-2 text-madder"
      >
        Delete learner {code}
      </button>
    );
  }
  return (
    <p className="text-sm">
      Delete learner {code} and all linked records?{" "}
      <button type="button" onClick={remove} className="underline">
        Yes, delete everything
      </button>{" "}
      <button type="button" onClick={() => setConfirming(false)} className="underline">
        Keep
      </button>
    </p>
  );
}
