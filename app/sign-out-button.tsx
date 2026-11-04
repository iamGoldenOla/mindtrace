"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignOutButton() {
  const router = useRouter();
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
    router.push("/");
    router.refresh();
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
