import Link from "next/link";
import Image from "next/image";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";
import { SeedButton } from "./seed-button";
import { ComparisonDemo } from "./trace-demo";
import { Trace } from "./attempts/[id]/trace";
import { align } from "@/lib/reading/align";

// Hero Trace: real Trace component fed by the real evidence engine.
// Form A target with a fixed synthetic transcript (vowel substitutions
// hat/hit, bed/bad, mat/met and ending omission digs/dig). No hand-drawn
// numbers: the caption counts below come from the alignment records.
const HERO_TARGET = [
  "Sam", "has", "a", "red", "hat", "The", "hat", "is", "on", "the", "bed",
  "A", "dog", "sits", "on", "the", "mat", "by", "the", "shed", "Then",
  "the", "dog", "digs", "in", "the", "sand", "and", "finds", "a", "shell",
];
const HERO_TRANSCRIPT =
  "sam has a red hit the hat is on the bad a dog sits on the met by " +
  "the shed then the dog dig in the sand and finds a shell";
const heroRecords = align(HERO_TARGET, HERO_TRANSCRIPT, "hero").records;
const heroWords = heroRecords.filter((r) => r.index >= 0);
const heroCorrect = heroWords.filter((r) => r.outcome === "match").length;

function Landing() {
  return (
    <main className="page-container py-12">
      {/* Hero Section */}
      <div className="grid items-center gap-10 lg:grid-cols-12 mb-16">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-4">
            <span className="w-2 h-2 rounded-full bg-pine animate-pulse" />
            <span>Meta Global AI Hackathon • Indie Developer Track</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ink leading-[1.15]">
            See why a child stumbles over a word, then verify whether your support helped.
          </h1>

          <p className="reading mt-4 text-base sm:text-lg text-ink/75 leading-relaxed">
            MINDTRACE gives teachers an intelligent observation workbench: investigate early reading and learning
            difficulties with countable evidence, try research-backed classroom accommodations, and compare matched
            outcomes without clinical delays.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/sign-in"
              className="rounded-lg bg-pine px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-pine/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine"
            >
              Launch Demo Dashboard
            </Link>
            <Link
              href="#trace-demo"
              className="rounded-lg border border-pine/30 bg-paper px-6 py-3 text-sm font-semibold text-pine hover:bg-mist transition-all"
            >
              See How It Works
            </Link>
            <Link
              href="/guides"
              className="rounded-lg border border-rule px-4 py-3 text-sm font-semibold text-ink/70 hover:text-ink hover:bg-paper transition-all"
            >
              Inclusive Guides →
            </Link>
          </div>

          {/* Quick Metrics Strip */}
          <div className="mt-10 pt-6 border-t border-rule grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="block font-serif text-xl font-bold text-pine">31 Words</span>
              <span className="text-[11px] text-ink/60">Matched passage forms</span>
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-pine">Pure Code</span>
              <span className="text-[11px] text-ink/60">Levenshtein alignment</span>
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-pine">0s Stored</span>
              <span className="text-[11px] text-ink/60">Speech purged instantly</span>
            </div>
            <div>
              <span className="block font-serif text-xl font-bold text-pine">Non-Clinical</span>
              <span className="text-[11px] text-ink/60">Strictly educational</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Trace Card */}
        <div className="lg:col-span-5">
          <figure className="rounded-2xl border border-rule bg-paper p-6 shadow-md relative">
            <div className="flex items-center justify-between mb-3 border-b border-rule/60 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-pine">Hero Trace</p>
                <p className="text-xs text-ink/60">Synthetic Learner: Form A Baseline</p>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-mist text-ink">
                Counted by Code
              </span>
            </div>

            <div className="mt-4">
              <Trace records={heroRecords} teacherEdited={false} />
            </div>

            <figcaption className="mt-4 pt-3 border-t border-rule/60 flex items-center justify-between text-xs text-ink/75">
              <span>
                <strong>{heroCorrect}</strong> of <strong>{heroWords.length}</strong> words read as written.
              </span>
              <span className="text-[11px] text-pine font-medium">Hover words for ID & error</span>
            </figcaption>

            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/70" aria-label="Trace legend">
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-0 w-3.5 border-t-4 border-pine" />
                <span>Read as written</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-0 w-3.5 border-t-4 border-marigold" />
                <span>Read differently</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-0 w-3.5 border-t-4 border-madder" />
                <span>Skipped</span>
              </li>
            </ul>
          </figure>
        </div>
      </div>

      {/* Visual Pipeline Showcase */}
      <section className="mb-20 rounded-2xl border border-rule bg-paper p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pine">The Acoustic-to-Evidence Pipeline</span>
            <h2 className="font-serif text-2xl font-bold text-ink mt-0.5">
              From Read-Aloud Audio to Countable Latency Tokens
            </h2>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine border border-pine/30 self-start md:self-auto">
            Zero-Audio Retention • Whisper ASR
          </span>
        </div>
        <div className="relative rounded-xl overflow-hidden border border-rule/80 bg-daylight/30">
          <Image
            src="/images/waveform-trace.svg"
            alt="Speech waveform to token latency alignment diagram"
            width={800}
            height={420}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
        <p className="mt-4 text-xs text-ink/70 leading-relaxed text-center sm:text-left">
          <strong>How it works:</strong> Audio is converted to word timestamps in volatile memory and immediately discarded. Deterministic code compares spoken tokens against passage targets, measuring millisecond hesitation latencies, omissions, and substitutions.
        </p>
      </section>

      {/* Built for Inclusive Learners: 3 Pillars */}
      <section className="mb-20">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-pine">Comprehensive Inclusivity</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
            Built for Diverse Learning Needs in Any Classroom
          </h2>
          <p className="mt-2 text-sm text-ink/70 reading">
            MINDTRACE recognizes that children struggle for very different reasons. We focus on observable patterns
            and classroom accommodations across three major areas:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1: Reading & Dyslexia Difficulties */}
          <div className="rounded-xl border border-rule bg-paper p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-pine/10 text-pine border border-pine/30 mb-3">
                <span>📖</span>
                <span>Oral Reading & Dyslexia</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-ink">The Reading Trace</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Word-level oral alignment identifies vowel sound substitutions (hat $\rightarrow$ hit), omitted word
                endings (digs $\rightarrow$ dig), and skipped small words without clinical delay.
              </p>

              <div className="mt-4 p-3 rounded-lg bg-daylight/70 border border-rule/60 text-xs">
                <span className="font-semibold text-pine block mb-1">Classroom Accommodations:</span>
                <p className="text-ink/75">Sound-by-sound pointing, chunked reading cards, and tinted backgrounds.</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-rule">
              <Link href="/guides/reading-difficulties" className="text-xs font-semibold text-pine hover:underline">
                View Reading Guide →
              </Link>
            </div>
          </div>

          {/* Pillar 2: Autism & Sensory Predictability */}
          <div className="rounded-xl border border-rule bg-paper p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-marigold/15 text-ink border border-marigold/40 mb-3">
                <span>🧩</span>
                <span>Autism & Sensory Needs</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-ink">Visual Schedules & Routines</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Supports learners who become distressed by unplanned transitions, sensory noise, or multi-step oral
                instructions through visual structure and countdown warnings.
              </p>

              {/* Mockup visual schedule widget */}
              <div className="mt-4 p-3 rounded-lg bg-daylight/70 border border-rule/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-medium text-ink/80 bg-paper px-2 py-1 rounded border border-rule/40">
                  <span>1. 📖 Read Aloud</span>
                  <span className="text-pine font-bold">✓ Done</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-ink/80 bg-paper px-2 py-1 rounded border border-pine/50">
                  <span>2. ✍️ Sound Match</span>
                  <span className="text-marigold font-bold">In Progress</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-medium text-ink/50 bg-paper/50 px-2 py-1 rounded border border-rule/30">
                  <span>3. 🌿 3-Min Quiet Break</span>
                  <span>Next</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-rule">
              <Link href="/guides/autism-communication-and-sensory" className="text-xs font-semibold text-pine hover:underline">
                View Autism Support Guide →
              </Link>
            </div>
          </div>

          {/* Pillar 3: Numeracy & Dyscalculia Patterns */}
          <div className="rounded-xl border border-rule bg-paper p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-dusk/15 text-ink border border-dusk/30 mb-3">
                <span>🔢</span>
                <span>Numeracy & Dyscalculia</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-ink">Place-Value & Magnitude</h3>
              <p className="mt-2 text-xs text-ink/70 leading-relaxed">
                Detects persistent mathematical error patterns such as column swaps, subitizing delays, and
                direction-of-subtraction errors ($52 - 17 = 45$).
              </p>

              {/* Mockup place value widget */}
              <div className="mt-4 p-3 rounded-lg bg-daylight/70 border border-rule/60 text-xs">
                <span className="font-semibold text-pine block mb-1">Concrete Manipulatives:</span>
                <p className="text-ink/75">Base-10 blocks, bead strings, and colour-coded place-value columns.</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-rule">
              <Link href="/guides/mathematics-number-sense" className="text-xs font-semibold text-pine hover:underline">
                View Math & Numeracy Guide →
              </Link>
            </div>
          </div>
        </div>

        {/* Multi-modal Classroom Suite Visual */}
        <div className="mt-8 rounded-2xl overflow-hidden border border-rule bg-paper shadow-xs">
          <Image
            src="/images/inclusive-classroom.svg"
            alt="Multi-modal classroom accommodation suite illustration"
            width={800}
            height={420}
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* The 5-Step Loop in Action */}
      <section id="trace-demo" className="mb-20 rounded-2xl border border-rule bg-paper p-8 shadow-sm">
        <div className="max-w-2xl mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-pine">The Classroom Loop</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
            How MINDTRACE Works in 5 Steps
          </h2>
          <p className="mt-2 text-sm text-ink/70 reading">
            From initial classroom observation to verifiable follow-up outcomes:
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-daylight/70 border border-rule/70">
            <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center mb-2">
              1
            </span>
            <h4 className="font-semibold text-sm text-ink">Observe</h4>
            <p className="mt-1 text-xs text-ink/70 leading-relaxed">
              Teacher records factual, observable behaviours in context. Sources are transparently logged.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-daylight/70 border border-rule/70">
            <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center mb-2">
              2
            </span>
            <h4 className="font-semibold text-sm text-ink">Investigate</h4>
            <p className="mt-1 text-xs text-ink/70 leading-relaxed">
              Learner reads Form A aloud. ASR transcribes speech and code aligns words to build the Trace.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-daylight/70 border border-rule/70">
            <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center mb-2">
              3
            </span>
            <h4 className="font-semibold text-sm text-ink">Adapt</h4>
            <p className="mt-1 text-xs text-ink/70 leading-relaxed">
              Muse Spark investigates the evidence, weighs competing explanations, and recommends supports.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-daylight/70 border border-rule/70">
            <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center mb-2">
              4
            </span>
            <h4 className="font-semibold text-sm text-ink">Support</h4>
            <p className="mt-1 text-xs text-ink/70 leading-relaxed">
              Teacher approves the strategy, applies it in class, and assigns matched follow-up Form B.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-daylight/70 border border-rule/70">
            <span className="w-6 h-6 rounded-full bg-pine text-white text-xs font-bold flex items-center justify-center mb-2">
              5
            </span>
            <h4 className="font-semibold text-sm text-ink">Verify</h4>
            <p className="mt-1 text-xs text-ink/70 leading-relaxed">
              Before and after Traces compare side-by-side with cautious wording that never claims cause.
            </p>
          </div>
        </div>

        {/* 5-Step Pipeline Graphic */}
        <div className="mt-6 rounded-xl overflow-hidden border border-rule bg-paper shadow-xs">
          <Image
            src="/images/investigation-loop.svg"
            alt="5-step classroom investigation loop infographic"
            width={840}
            height={260}
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* Before and After Comparison Section */}
      <section className="mb-20">
        <div className="max-w-2xl mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-pine">Verified Outcomes</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mt-1">
            Before and After Comparison
          </h2>
          <p className="mt-2 text-sm text-ink/70 reading">
            Compare Form A (baseline) against Form B (follow-up with support applied). The comparison respects
            conservative thresholds and highlights caveats honestly:
          </p>
        </div>
        <ComparisonDemo />
      </section>

      {/* Ethical Safeguards Grid */}
      <section className="mb-20 rounded-2xl border border-rule bg-paper p-8 shadow-sm">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-2">Grounded by Design</h2>
        <p className="text-xs text-ink/65 mb-6 reading">
          Built around child privacy, verifiable claims, and strict non-diagnostic ethics.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-4 rounded-xl border border-rule/60 bg-daylight/50">
            <h3 className="font-semibold text-sm text-ink">Evidence Before Claims</h3>
            <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
              Every AI claim cites recorded evidence IDs. Reports that fail the verifier pass are never presented as
              successful.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rule/60 bg-daylight/50">
            <h3 className="font-semibold text-sm text-ink">Zero Audio Retention</h3>
            <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
              Read-aloud audio is transcribed in temporary memory and immediately discarded. Never stored or logged.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rule/60 bg-daylight/50">
            <h3 className="font-semibold text-sm text-ink">No Diagnosis or Medical Advice</h3>
            <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
              Zero condition labels (no &ldquo;is dyslexic&rdquo;), no probability scores, and no treatment advice. Educational
              supports only.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-rule/60 bg-daylight/50">
            <h3 className="font-semibold text-sm text-ink">100% Synthetic Demo Data</h3>
            <p className="mt-1.5 text-xs text-ink/70 leading-relaxed">
              All demo profiles, attempts, and transcripts represent synthetic personas. No real children&apos;s
              records exist anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Demo Launcher Box */}
      <div className="rounded-2xl border-2 border-pine/30 bg-pine/5 p-8 shadow-sm">
        <div className="max-w-2xl">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pine">Experience the Demo Dashboard</h2>
          <p className="mt-2 text-sm text-ink/80 reading">
            First time visiting? Click below to seed synthetic learners (L-0001 through L-0004), then explore the
            investigation workflow as Teacher A.
          </p>
        </div>
        <div className="mt-4">
          <SeedButton />
        </div>
      </div>
    </main>
  );
}

export default async function Home() {
  const user = await getDevUser();
  if (!user) return <Landing />;
  const repo = getRepository();
  const learners = await repo.listLearnersForUser(user.id);
  const recent: { code: string; status: string; started: string }[] = [];
  for (const l of learners) {
    const attempts = await repo.listAttemptsByLearner(l.id);
    for (const a of attempts.slice(0, 2)) {
      recent.push({ code: l.code, status: a.status, started: a.started_at });
    }
  }
  recent.sort((a, b) => (a.started < b.started ? 1 : -1));

  return (
    <main className="page-container py-10">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-rule pb-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-2">
            <span>Teacher Workspace • Demo Mode</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            Welcome, {user.displayName}
          </h1>
          <p className="mt-1 text-sm text-ink/70">
            Investigate learning barriers, assign accommodations, and verify outcomes with countable evidence.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/learners"
            className="rounded-md bg-pine px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-pine/90 transition-all"
          >
            View All Learners ({learners.length})
          </Link>
          <Link
            href="/guides"
            className="rounded-md border border-rule bg-paper px-4 py-2 text-xs font-semibold text-ink/80 hover:bg-mist transition-all"
          >
            Browse Concern Guides
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Learners Grid (2 cols) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl font-bold text-ink">Your Synthetic Learners</h2>
            <Link href="/learners" className="text-xs font-semibold text-pine hover:underline">
              Manage Learners →
            </Link>
          </div>

          {learners.length === 0 ? (
            <div className="rounded-xl border border-dashed border-rule p-8 text-center bg-paper">
              <p className="text-sm font-semibold text-ink">No learners in this account yet.</p>
              <p className="mt-1 text-xs text-ink/60">Seed the synthetic demo data from the home screen.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learners.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-rule bg-paper p-5 shadow-sm hover:shadow-md hover:border-pine/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-mono font-bold text-pine bg-pine/10 px-2 py-0.5 rounded">
                        {l.code}
                      </span>
                      <span className="text-[11px] text-ink/50 capitalize">
                        {l.stage ?? "Stage not set"}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-ink">
                      {l.pseudonym ? `${l.pseudonym} (${l.code})` : `Learner ${l.code}`}
                    </h3>

                    <p className="text-xs text-ink/60 mt-1">
                      Language: <span className="font-medium text-ink/80 uppercase">{l.assessment_language}</span>
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-rule flex items-center justify-between">
                    <Link
                      href={`/learners/${l.id}`}
                      className="text-xs font-semibold text-pine hover:underline"
                    >
                      Open Learner Profile →
                    </Link>
                    <Link
                      href={`/learners/${l.id}/read`}
                      className="rounded bg-mist/70 px-2.5 py-1 text-[11px] font-semibold text-ink hover:bg-pine hover:text-white transition-colors"
                    >
                      Start Reading
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Recent Activity & Quick Tools */}
        <div className="space-y-6">
          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-ink mb-3">Recent Reading Attempts</h3>
            {recent.length === 0 ? (
              <p className="text-xs text-ink/60">No readings recorded yet.</p>
            ) : (
              <ul className="divide-y divide-rule text-xs">
                {recent.slice(0, 5).map((r, i) => (
                  <li key={`${r.code}-${r.started}-${i}`} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-ink">Learner {r.code}</span>
                      <span className="block text-[11px] text-ink/50 capitalize">{r.status} attempt</span>
                    </div>
                    <span className="text-[10px] text-ink/40 font-mono">{r.started.slice(0, 10)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-rule bg-paper p-5 shadow-sm">
            <h3 className="font-serif text-lg font-bold text-ink mb-2">Inclusive Quick Links</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/guides/autism-communication-and-sensory"
                  className="text-pine font-medium hover:underline block"
                >
                  🧩 Autism & Sensory Accommodations
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/mathematics-number-sense"
                  className="text-pine font-medium hover:underline block"
                >
                  🔢 Dyscalculia & Number Sense
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-pine font-medium hover:underline block"
                >
                  📚 UNICEF & BDA Inclusive Resources
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
