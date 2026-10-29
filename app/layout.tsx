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
          aria-label="Development sign-in notice"
          className="bg-ink px-4 py-2 text-center text-sm text-white"
        >
          Development sign-in, not for production. Synthetic data only.
        </div>
        <header className="border-b border-rule bg-paper">
          <nav
            aria-label="Primary"
            className="mx-auto flex max-w-4xl flex-wrap items-center gap-x-5 gap-y-2 px-6 py-3"
          >
            <Link href="/" className="font-serif text-xl">
              MINDTRACE
            </Link>
            <Link href="/learners">Learners</Link>
            <Link href="/resources">Resources</Link>
            <Link href="/guides">Guides</Link>
            <span className="ml-auto text-sm">
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
        <footer className="mx-auto max-w-4xl px-6 py-8 text-sm">
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
