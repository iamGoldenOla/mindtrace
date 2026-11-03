"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type SeedStatus =
  | {
      ok: true;
      backend: "supabase" | "local";
      seeded: boolean;
      teachers: string[];
      learners: number;
    }
  | { ok: false; error: string };

export function SeedButton() {
  const [status, setStatus] = useState<SeedStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/dev/seed");
      if (!res.ok) {
        if (res.status === 404) {
          setStatus({
            ok: false,
            error: "Demo sign-in is not enabled on this deployment.",
          });
        } else {
          setStatus({
            ok: false,
            error: "The demo store could not be reached. Try again.",
          });
        }
        return;
      }
      setStatus((await res.json()) as SeedStatus);
    } catch {
      setStatus({
        ok: false,
        error: "The demo store could not be reached. Try again.",
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function seed() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dev/seed", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as {
        counts?: { learners?: number };
        error?: string;
      };
      if (!res.ok) {
        setMessage(data.error ?? "Seeding failed. Is the dev server running?");
        await refresh();
        return;
      }
      await refresh();
    } catch {
      setMessage("Seeding failed. Is the dev server running?");
    } finally {
      setBusy(false);
    }
  }

  const seeded = status && status.ok && status.seeded;

  return (
    <div className="mt-4">
      {status === null ? (
        <p role="status" className="text-sm">
          Checking demo data.
        </p>
      ) : !status.ok ? (
        <p role="status" className="text-sm">
          {status.error}
        </p>
      ) : seeded ? (
        <p role="status" className="text-sm">
          Demo data ready ({status.learners} learners). Now sign in as
          Teacher A. Re-seeding signs everyone out.
        </p>
      ) : (
        <p role="status" className="text-sm">
          Demo data is not set up yet. Seed it first, then sign in.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={seed}
          disabled={busy}
          className="rounded border border-pine px-4 py-2 text-pine disabled:opacity-60"
        >
          {busy ? "Seeding" : seeded ? "Re-seed demo data" : "Seed demo data"}
        </button>
        {seeded ? (
          <Link className="rounded bg-pine px-4 py-2 text-white" href="/sign-in">
            Sign in as Teacher A
          </Link>
        ) : null}
      </div>
      {message ? (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}
