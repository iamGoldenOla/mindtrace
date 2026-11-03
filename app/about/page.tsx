import Link from "next/link";

export default function About() {
  return (
    <main className="page-container py-14">
      <h1 className="font-serif text-4xl leading-tight">About MINDTRACE</h1>
      <p className="reading mt-4 text-lg leading-relaxed">
        When a child struggles, adults usually know that something is wrong
        but not why, what to try, or whether it worked. MINDTRACE helps a
        teacher investigate the learning barrier with real evidence, support
        the learner with a specific adjustment, and verify whether the
        adjustment helped.
      </p>

      <div className="mt-12 grid gap-x-10 gap-y-12 md:grid-cols-2">
        <section aria-label="The loop">
          <h2 className="font-serif text-2xl">The loop</h2>
          <ol className="mt-3 divide-y divide-rule border-y border-rule">
            <li className="py-3">
              <span className="font-semibold">Observe.</span> Record what happened,
              exactly as it happened, with the source noted.
            </li>
            <li className="py-3">
              <span className="font-semibold">Investigate.</span> Reading evidence
              is aligned word by word; an AI agent weighs competing explanations
              and a verifier checks every claim.
            </li>
            <li className="py-3">
              <span className="font-semibold">Adapt and support.</span> The teacher
              picks a concrete classroom strategy and assigns a matched follow-up.
            </li>
            <li className="py-3">
              <span className="font-semibold">Verify.</span> Before and after are
              compared with careful wording that never claims cause.
            </li>
          </ol>
        </section>

        <section aria-label="Guardrails">
          <h2 className="font-serif text-2xl">What it is not</h2>
          <div className="mt-3 rounded bg-paper p-5">
            <p>
              MINDTRACE gives educational observations, not diagnoses. It never
              names a condition as a finding about a learner, never gives
              probabilities, and never advises treatment. When a sustained pattern
              calls for more help, it suggests discussing it with a qualified
              professional.
            </p>
          </div>

          <h2 className="mt-12 font-serif text-2xl">Technology</h2>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            <li className="py-3">
              Muse Spark drafts the investigation as a tool-calling agent, and a
              separate verifier pass checks every claim against the evidence.
            </li>
            <li className="py-3">
              Muse Voice Transcribe turns read-aloud speech into a transcript. The
              audio is discarded immediately and never stored.
            </li>
            <li className="py-3">
              Alignment, counts, and comparisons are deterministic code, not model
              output. The model interprets evidence; it never computes scores.
            </li>
          </ul>
        </section>
      </div>

      <h2 className="mt-12 font-serif text-2xl">Built in the open</h2>
      <p className="reading mt-3">
        MINDTRACE was built from scratch during the Meta Global AI Developer
        Hackathon, Oct 27 to Nov 4, 2026, Indie track. The repository is
        public. Every learner, transcript, and recording in the demo is
        synthetic. No real children&apos;s data appears anywhere.
      </p>

      <h2 className="mt-12 font-serif text-2xl">Built by</h2>
      <p className="reading mt-3">
        MINDTRACE was built solely by Akinola Olujobi, an educator and
        developer in Lagos, Nigeria, during the Meta Global AI Developer
        Hackathon (Oct 27 to Nov 3, 2026), using Muse Code as the coding
        assistant. The product design, specifications and decisions are the
        developer&apos;s own.
      </p>

      <p className="mt-12">
        <Link className="rounded bg-pine px-6 py-3 text-white" href="/sign-in">
          Sign in
        </Link>
      </p>
    </main>
  );
}
