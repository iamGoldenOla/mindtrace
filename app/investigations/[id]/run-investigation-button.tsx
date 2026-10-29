"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const STAGE_LABELS = ["Reading evidence", "Checking history", "Weighing explanations", "Verifying claims"];

export function RunInvestigationButton({ investigationId }: { investigationId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [stages, setStages] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setStages([]);
    setMessage(null);
    try {
      const res = await fetch(`/api/investigations/${investigationId}/run`, { method: "POST" });
      if (!res.ok || !res.body) {
        setMessage("Could not start the investigation. Try again.");
        setRunning(false);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as {
            stage?: string;
            done?: boolean;
            reportId?: string | null;
            passed?: boolean;
            problems?: string[];
          };
          if (event.stage) {
            setStages((s) => (s.includes(event.stage as string) ? s : [...s, event.stage as string]));
          }
          if (event.done) {
            setRunning(false);
            if (event.passed && event.reportId) {
              router.push(`/reports/${event.reportId}`);
              router.refresh();
            } else {
              setMessage(
                event.problems?.[0] ?? "The report could not be verified. The evidence is kept."
              );
              router.refresh();
            }
          }
        }
      }
    } catch {
      setMessage("The connection was lost. The evidence is kept. Try again.");
      setRunning(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="rounded bg-pine px-6 py-3 text-white disabled:opacity-60"
      >
        {running ? "Investigating" : "Run investigation"}
      </button>
      {running || stages.length > 0 ? (
        <ul className="mt-3 text-sm" aria-live="polite">
          {STAGE_LABELS.map((s) => (
            <li key={s}>{stages.includes(s) ? `… ${s}` : s}</li>
          ))}
        </ul>
      ) : null}
      {message ? (
        <p role="status" className="mt-3">
          {message}
        </p>
      ) : null}
    </div>
  );
}
