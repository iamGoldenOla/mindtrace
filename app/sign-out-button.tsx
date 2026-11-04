"use client";

import { useState } from "react";

export function SignOutButton() {
  const [message, setMessage] = useState<string | null>(null);

  async function signOut() {
    setMessage(null);
    let res: Response;
    try {
      res = await fetch("/api/dev/sign-out", { method: "POST" });
    } catch {
      setMessage("Sign-out did not work. Try again.");
      return;
    }
    if (!res.ok) {
      setMessage("Sign-out did not work. Try again.");
      return;
    }
    // Full reload, not a client-side transition: the signed-in layout must
    // never paint from stale cache after the session cookie is gone.
    window.location.assign("/");
  }

  return (
    <span>
      <button type="button" onClick={signOut} className="underline">
        Sign out
      </button>
      {message ? (
        <span role="status" className="ml-2 text-sm">
          {message}
        </span>
      ) : null}
    </span>
  );
}
