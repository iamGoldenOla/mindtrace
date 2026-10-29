"use client";

import { useState } from "react";
import { supabaseAnon } from "@/lib/db/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    try {
      const db = supabaseAnon();
      const { error } = await db.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage("Sign-in did not work. Check the email and password.");
        return;
      }
      setSignedIn(true);
      setMessage("Signed in.");
    } catch {
      setMessage("Sign-in did not work. Try again.");
    }
  }

  async function signOut() {
    try {
      await supabaseAnon().auth.signOut();
    } finally {
      setSignedIn(false);
      setMessage("Signed out.");
    }
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-serif text-3xl">Sign in</h1>
      <p className="mt-2">Use your teacher account to open your learners.</p>
      {signedIn ? (
        <button
          type="button"
          onClick={signOut}
          className="mt-6 rounded bg-pine px-4 py-2 text-white"
        >
          Sign out
        </button>
      ) : (
        <form onSubmit={signIn} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded border border-rule px-3 py-2"
              autoComplete="email"
            />
          </label>
          <label className="flex flex-col gap-1">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded border border-rule px-3 py-2"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-pine px-4 py-2 text-white"
          >
            Sign in
          </button>
        </form>
      )}
      {message ? <p className="mt-4" role="status">{message}</p> : null}
    </main>
  );
}
