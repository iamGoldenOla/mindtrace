"use client";

// Root error boundary. Next.js requires this file: without it, any error in
// the root layout shows "missing required error components" instead of a
// readable message. Must define its own html and body tags.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <main className="mx-auto max-w-3xl px-6 py-14">
          <h1 className="font-serif text-3xl">Something went wrong</h1>
          <p className="mt-4">
            The page could not be shown. Your data is kept. Try again, and if
            the problem stays, restart the development server.
          </p>
          <p className="mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="rounded bg-pine px-6 py-3 text-white"
            >
              Try again
            </button>
          </p>
          <p className="mt-8 border-t border-rule pt-4 text-sm">
            MINDTRACE gives educational observations, not diagnoses. If you
            have concerns about a child&apos;s development or health, talk to a
            qualified professional.
          </p>
        </main>
      </body>
    </html>
  );
}
