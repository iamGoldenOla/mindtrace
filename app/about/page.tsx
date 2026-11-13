import Link from "next/link";
import Image from "next/image";

export default function About() {
  return (
    <main className="page-container py-14 max-w-4xl">
      {/* Hero Header */}
      <div className="mb-12">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-3">
          Our Story & Philosophy
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-tight">
          Built for Teachers Without Specialist Access
        </h1>
        <p className="mt-4 text-base sm:text-lg text-ink/75 reading leading-relaxed">
          When a child repeatedly struggles to read or follow classroom tasks, teachers almost always know that
          something is wrong. But without educational psychologists or specialists nearby, they are left with
          guesswork. MINDTRACE was built to bridge this gap with real, countable evidence and immediate classroom
          supports.
        </p>
      </div>

      {/* The Context / Origin Story */}
      <section className="mb-14 rounded-2xl border border-rule bg-paper p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-pine flex items-center justify-center text-paper font-serif font-bold text-lg">
            NG
          </div>
          <div>
            <h2 className="font-serif text-2xl font-bold text-ink">Built for the World from Lagos, Nigeria</h2>
            <p className="text-xs text-ink/60">Meta Global AI Developer Hackathon • Indie Developer Track</p>
          </div>
        </div>
        <div className="text-sm text-ink/80 space-y-4 reading leading-relaxed">
          <p>
            MINDTRACE was created by <strong>Akinola Olujobi</strong>, an educator and developer based in Lagos,
            Nigeria, participating solo in the Meta Global AI Developer Hackathon (October 27 – November 4, 2026),
            assisted by Meta&apos;s <strong>Muse Code</strong> coding assistant.
          </p>
          <p>
            In the majority of public schools across sub-Saharan Africa and underserved classrooms worldwide, there is
            <strong>no SENCo (Special Educational Needs Coordinator)</strong>, no on-site speech therapist, and no
            educational psychologist. When a child stumbles over words or shuts down during math, waiting 6 to 18
            months for a specialist assessment is not an option.
          </p>
          <p>
            MINDTRACE does not replace the clinician. Instead, it equips the teacher with an intelligent observation
            workbench: gather countable evidence on oral reading and task persistence, test a research-backed classroom
            adjustment, verify whether it worked, and compile an organized evidence dossier if formal referral is ever
            needed.
          </p>
        </div>
      </section>

      {/* The 5-Step Loop Section */}
      <section className="mb-14">
        <div className="mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-pine">The Methodology</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
            Observe • Investigate • Adapt • Support • Verify
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="font-serif text-lg font-bold text-ink">Observe</h3>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed">
              Record concrete, factual classroom observations tagged with source (teacher report, observed action,
              parent note). No diagnostic labels or clinical jargon.
            </p>
          </div>

          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="font-serif text-lg font-bold text-ink">Investigate (The Trace)</h3>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed">
              The learner reads a matched 31-word passage. Pure deterministic code aligns speech against target text,
              creating the <strong>Trace</strong>: counting vowel substitutions, ending omissions, and word skips.
            </p>
          </div>

          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="font-serif text-lg font-bold text-ink">Adapt (AI Agent)</h3>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed">
              Meta&apos;s <strong>Muse Spark 1.3</strong> runs as a bounded tool-calling agent. It reads the structured
              evidence, weighs competing explanations (fatigue, language familiarity, formatting), and recommends
              actionable accommodations from a reviewed catalogue.
            </p>
          </div>

          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="font-serif text-lg font-bold text-ink">Verify</h3>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed">
              A strict secondary verifier model checks every claim against recorded evidence IDs. The teacher assigns
              a matched follow-up passage (Form B) to compare before and after outcomes with cautious, non-causal language.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl overflow-hidden border border-rule bg-paper shadow-xs">
          <Image
            src="/images/investigation-loop.svg"
            alt="MINDTRACE 5-Step classroom loop diagram"
            width={840}
            height={260}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      </section>

      {/* Meta AI Stack Grid */}
      <section className="mb-14 rounded-2xl border border-rule bg-paper p-8 shadow-sm">
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Powered by Meta AI Models</h2>
        <p className="text-xs text-ink/65 mb-6 reading">
          Built exclusively using Meta&apos;s model suite in compliance with the hackathon architecture rules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-rule/70 bg-daylight/60">
            <span className="text-xs font-bold text-pine uppercase tracking-wider block mb-1">
              Muse Spark 1.3
            </span>
            <h4 className="text-sm font-semibold text-ink">Investigator & Verifier</h4>
            <p className="mt-1 text-xs text-ink/70">
              Runs tool-calling investigation loops, explores competing hypotheses, and verifies report claims.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rule/70 bg-daylight/60">
            <span className="text-xs font-bold text-pine uppercase tracking-wider block mb-1">
              Muse Voice Transcribe
            </span>
            <h4 className="text-sm font-semibold text-ink">Read-Aloud Evidence</h4>
            <p className="mt-1 text-xs text-ink/70">
              Transcribes oral reading in real time. Audio is converted to text and immediately purged from memory.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rule/70 bg-daylight/60">
            <span className="text-xs font-bold text-pine uppercase tracking-wider block mb-1">
              Muse Image 1.0
            </span>
            <h4 className="text-sm font-semibold text-ink">Visual Supports</h4>
            <p className="mt-1 text-xs text-ink/70">
              Generates teacher-reviewed visual schedules and picture communication cards for inclusive learners.
            </p>
          </div>
        </div>
      </section>

      {/* Ethical Safeguards */}
      <section className="rounded-2xl border-2 border-pine/20 bg-pine/5 p-8">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-pine text-white flex items-center justify-center font-bold text-sm">
            ✓
          </div>
          <h2 className="font-serif text-2xl font-bold text-pine">Child Safeguarding & Legal Guardrails</h2>
        </div>
        <ul className="space-y-3 text-sm text-ink reading leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-pine font-bold mt-0.5">•</span>
            <span>
              <strong>Zero Audio Storage:</strong> Audio recordings are transcribed into text buffers and immediately
              deleted. Voices are never stored, logged, or uploaded to permanent disks.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pine font-bold mt-0.5">•</span>
            <span>
              <strong>No Diagnostic Claims:</strong> MINDTRACE never states or implies that a child has dyslexia,
              ADHD, autism, or dyscalculia. It observes countable reading and task patterns only.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-pine font-bold mt-0.5">•</span>
            <span>
              <strong>Synthetic Demo Data:</strong> Every demo profile is a synthetic persona. No real children&apos;s
              identities, school records, or voices are included in the repository or demo.
            </span>
          </li>
        </ul>

        <div className="mt-6 pt-4 border-t border-pine/20 flex flex-wrap gap-4">
          <Link
            href="/sign-in"
            className="rounded-md bg-pine px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-pine/90 transition-all"
          >
            Try the Demo Dashboard
          </Link>
          <Link
            href="/guides"
            className="rounded-md border border-pine/30 bg-paper px-5 py-2.5 text-xs font-semibold text-pine hover:bg-mist transition-all"
          >
            Browse Concern Guides
          </Link>
        </div>
      </section>
    </main>
  );
}
