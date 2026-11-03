"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DEV_TEACHERS } from "@/lib/auth/dev-accounts";

export default function SignInPage() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function signIn(email: string) {
    setMessage(null);
    const res = await fetch("/api/dev/sign-in", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      setMessage("Sign-in did not work. Try again.");
      return;
    }
    router.push("/learners");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <p className="rounded border border-marigold bg-paper px-3 py-2 text-sm">
        Demo accounts. Synthetic data only.
      </p>
      <h1 className="mt-6 font-serif text-3xl">Sign in</h1>
      <p className="mt-2">Choose a synthetic teacher account.</p>
      <div className="mt-6 flex flex-col gap-3">
        {DEV_TEACHERS.map((t) => (
          <button
            key={t.email}
            type="button"
            onClick={() => signIn(t.email)}
            className="rounded bg-pine px-4 py-3 text-left text-white"
          >
            {t.displayName}
            <span className="block text-sm opacity-80">{t.email}</span>
          </button>
        ))}
      </div>
      {message ? (
        <p className="mt-4" role="status">
          {message}
        </p>
      ) : null}
    </main>
  );
}
