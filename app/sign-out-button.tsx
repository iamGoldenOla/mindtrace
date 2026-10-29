"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/dev/sign-out", { method: "POST" });
    router.push("/sign-in");
    router.refresh();
  }
  return (
    <button type="button" onClick={signOut} className="underline">
      Sign out
    </button>
  );
}
