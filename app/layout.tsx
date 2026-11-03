import type { Metadata } from "next";
import Link from "next/link";
import { getDevUser } from "@/lib/auth/dev";
import { SignOutButton } from "./sign-out-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDTRACE",
  description:
    "Investigate reading barriers with evidence, try a support, and verify what helped.",
};

// Every page depends on the sign-in cookie, so never prerender statically.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDevUser();
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div
          role="note"
          aria-label="Demo mode notice"
          className="bg-ink py-2 text-sm text-white"
        >
          <p className="page-container">
            Demo mode: synthetic data only, not for real learners.
          </p>
        </div>
        <header className="border-b border-rule bg-paper">
          <nav
            aria-label="Primary"
            className="page-container flex flex-wrap items-center gap-x-5 gap-y-2 py-3"
          >
            <Link href="/" className="font-serif text-xl">
              MINDTRACE
            </Link>
            <span className="flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-2">
              <Link href="/">Home</Link>
              <Link href="/about">About</Link>
              <Link href="/learners">Learners</Link>
              <Link href="/resources">Resources</Link>
              <Link href="/guides">Guides</Link>
            </span>
            <span className="text-sm">
              {user ? (
                <>
                  {user.displayName} <SignOutButton />
                </>
              ) : (
                <Link href="/sign-in">Sign in</Link>
              )}
            </span>
          </nav>
        </header>
        {children}
        <footer className="page-container py-8 text-sm">
          <p className="border-t border-rule pt-4">
            MINDTRACE gives educational observations, not diagnoses. If you
            have concerns about a child&apos;s development or health, talk to a
            qualified professional.
          </p>
        </footer>
      </body>
    </html>
  );
}
