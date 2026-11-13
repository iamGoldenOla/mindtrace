import type { Metadata } from "next";
import Link from "next/link";
import { getDevUser } from "@/lib/auth/dev";
import { SignOutButton } from "./sign-out-button";
import "./globals.css";

export const metadata: Metadata = {
  title: "MINDTRACE — Learning Intelligence & Inclusion Platform",
  description:
    "An AI agent that investigates why a learner is struggling, tries a classroom support, and verifies whether it helped.",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDevUser();

  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col font-sans antialiased bg-daylight text-ink">
        {/* Top Safeguarding & Demo Banner */}
        <div
          role="note"
          aria-label="Demo mode notice"
          className="bg-ink text-paper py-2 px-4 text-xs font-medium border-b border-ink/20"
        >
          <div className="page-container flex flex-wrap items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-marigold animate-pulse" />
              <span>Demo Mode: 100% synthetic learner data. Strictly non-diagnostic educational observations.</span>
            </span>
            <span className="text-paper/70 text-[11px] hidden sm:inline">
              Built for the Meta Global AI Developer Hackathon
            </span>
          </div>
        </div>

        {/* Global Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-sm shadow-sm transition-all">
          <nav
            aria-label="Primary Navigation"
            className="page-container flex items-center justify-between py-3.5"
          >
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight text-ink hover:text-pine transition-colors"
            >
              <div className="w-8 h-8 rounded-md bg-pine flex items-center justify-center text-paper shadow-sm">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 12h5l2-7 4 14 3-7h6" />
                </svg>
              </div>
              <span>MINDTRACE</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1 text-sm font-medium text-ink/80">
              <Link
                href="/"
                className="px-3 py-1.5 rounded-md hover:bg-mist/70 hover:text-ink transition-colors"
              >
                Home
              </Link>
              <Link
                href="/learners"
                className="px-3 py-1.5 rounded-md hover:bg-mist/70 hover:text-ink transition-colors"
              >
                Learners
              </Link>
              <Link
                href="/guides"
                className="px-3 py-1.5 rounded-md hover:bg-mist/70 hover:text-ink transition-colors"
              >
                Concern Guides
              </Link>
              <Link
                href="/resources"
                className="px-3 py-1.5 rounded-md hover:bg-mist/70 hover:text-ink transition-colors"
              >
                Inclusive Library
              </Link>
              <Link
                href="/about"
                className="px-3 py-1.5 rounded-md hover:bg-mist/70 hover:text-ink transition-colors"
              >
                About
              </Link>
            </div>

            {/* Auth / Account Action */}
            <div className="flex items-center gap-3 text-sm">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="font-semibold text-ink text-xs">{user.displayName}</span>
                    <span className="text-[10px] text-pine font-medium uppercase tracking-wider">Teacher Account</span>
                  </div>
                  <SignOutButton />
                </div>
              ) : (
                <Link
                  href="/sign-in"
                  className="rounded-md bg-pine px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-pine/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine"
                >
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </header>

        {/* Page Content */}
        <div className="flex-1">{children}</div>

        {/* Global Footer */}
        <footer className="mt-20 border-t border-rule bg-paper">
          <div className="page-container py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
              <div className="md:col-span-2">
                <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-ink">
                  <div className="w-6 h-6 rounded bg-pine flex items-center justify-center text-paper text-xs">
                    MT
                  </div>
                  <span>MINDTRACE</span>
                </Link>
                <p className="mt-3 text-sm text-ink/70 reading">
                  An AI-powered learning intelligence and inclusion platform built to help teachers investigate
                  repeated struggles with countable evidence, try actionable classroom accommodations, and verify
                  outcomes.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-ink/60">
                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-mist text-ink/80 font-medium">
                    Meta Hackathon (Indie Track)
                  </span>
                  <span>•</span>
                  <span>Built by Akinola Olujobi (Lagos, Nigeria)</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-ink/90">Platform</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  <li>
                    <Link href="/learners" className="hover:text-pine transition-colors">
                      Synthetic Learners
                    </Link>
                  </li>
                  <li>
                    <Link href="/guides" className="hover:text-pine transition-colors">
                      Classroom Concern Guides
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="hover:text-pine transition-colors">
                      Reviewed Resources
                    </Link>
                  </li>
                  <li>
                    <Link href="/about" className="hover:text-pine transition-colors">
                      Mission & Methodology
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-ink/90">Safeguards & Code</h3>
                <ul className="mt-3 space-y-2 text-sm text-ink/70">
                  <li>
                    <a
                      href="https://github.com/iamGoldenOla/mindtrace"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-pine transition-colors inline-flex items-center gap-1"
                    >
                      <span>GitHub Repository</span>
                      <svg className="w-3.5 h-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <span className="text-ink/60">Zero Audio Storage</span>
                  </li>
                  <li>
                    <span className="text-ink/60">Strict Non-Diagnostic</span>
                  </li>
                  <li>
                    <span className="text-ink/60">Row-Level Security (RLS)</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-rule pt-6 text-xs text-ink/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p>
                <strong>Safeguarding Notice:</strong> MINDTRACE produces educational observations and classroom support
                recommendations only. It never provides clinical diagnoses or medical advice.
              </p>
              <p className="shrink-0 text-ink/50">© 2026 MINDTRACE</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
