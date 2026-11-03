import Link from "next/link";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";
import { SeedButton } from "./seed-button";
import { ComparisonDemo, ExampleTrace } from "./trace-demo";
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
    <main className="mx-auto max-w-4xl px-6 py-14">
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div>
          <h1 className="font-serif text-4xl leading-tight">
            See why a child stumbles over a word, then check whether your support helped.
          </h1>
          <p className="mt-4 text-lg leading-relaxed">
            MINDTRACE helps teachers investigate a reading difficulty with
            real evidence, choose a classroom support, and compare a matched
            follow-up.
          </p>
          <p className="mt-6 flex flex-wrap gap-3">
            <Link className="rounded bg-pine px-6 py-3 text-white" href="/sign-in">
              Try the demo
            </Link>
            <Link className="rounded border border-pine px-6 py-3 text-pine" href="#loop">
              See how it works
            </Link>
          </p>
        </div>
        <figure className="rounded bg-paper p-5">
          <p className="text-sm font-semibold">Example from a synthetic learner</p>
          <div className="mt-3">
            <Trace records={heroRecords} teacherEdited={false} />
          </div>
          <figcaption className="mt-3 text-sm">
            {heroCorrect} of {heroWords.length} words read as written. Each
            word is evidence, counted by code.
          </figcaption>
        </figure>
      </div>

      <h2 id="loop" className="mt-12 font-serif text-2xl">How it works</h2>
      <ol className="mt-3 divide-y divide-rule border-y border-rule">
        <li className="py-3">
          <span className="font-semibold">1. Observe.</span> Record what happened,
          exactly as it happened, with the source. Then the learner reads aloud;
          speech is transcribed and the audio discarded.
        </li>
        <li className="py-3">
          <span className="font-semibold">2. Investigate.</span> Code aligns every
          word into the Trace. Muse Spark reads the evidence through tools and
          drafts a report; a verifier checks every claim against the evidence.
        </li>
        <li className="py-3">
          <span className="font-semibold">3. Support.</span> The teacher picks a
          concrete strategy from the catalogue and assigns a matched follow-up.
        </li>
        <li className="py-3">
          <span className="font-semibold">4. Verify.</span> Before and after
          Traces are compared with careful wording that never claims cause.
        </li>
      </ol>

      <h2 className="mt-12 font-serif text-2xl">What the teacher sees</h2>
      <ExampleTrace />

      <h2 className="mt-12 font-serif text-2xl">Before and after</h2>
      <ComparisonDemo />

      <h2 className="mt-12 font-serif text-2xl">Grounded by design</h2>
      <ul className="mt-3 divide-y divide-rule border-y border-rule">
        <li className="py-3">
          Every AI claim cites evidence IDs. Reports that fail verification
          are never shown as successful.
        </li>
        <li className="py-3">
          Read-aloud audio is transcribed and then discarded. It is never
          stored, logged, or kept anywhere.
        </li>
        <li className="py-3">
          No diagnoses, no probabilities, no treatment advice. Only
          educational observations and referral guidance.
        </li>
        <li className="py-3">
          Every record in the demo belongs to a synthetic learner. No real
          children&apos;s data appears anywhere.
        </li>
      </ul>

      <div className="mt-12 rounded bg-paper p-5">
        <h2 className="font-serif text-2xl">Try the demo</h2>
        <p className="mt-2">
          First visit? Seed four synthetic learners, then sign in as Teacher A.
          No real children&apos;s data anywhere.
        </p>
        <SeedButton />
      </div>

      <p className="mt-8 border-t border-rule pt-4 text-sm">
        MINDTRACE gives educational observations, not diagnoses. If you have
        concerns about a child&apos;s development or health, talk to a qualified
        professional.
      </p>
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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl">Today</h1>
      <p className="mt-2">
        Investigate a reading concern, try a support, and verify what helped.
      </p>
      <h2 className="mt-8 font-serif text-2xl">Your learners</h2>
      {learners.length === 0 ? (
        <p className="mt-3">
          No learners yet. Seed the synthetic demo data first.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {learners.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-3">
              <span>
                Learner {l.code}
                {l.stage ? `, ${l.stage}` : ""}
              </span>
              <Link className="underline" href={`/learners/${l.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-8 font-serif text-2xl">Recent attempts</h2>
      {recent.length === 0 ? (
        <p className="mt-3">No readings yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {recent.slice(0, 5).map((r, i) => (
            <li key={`${r.code}-${r.started}-${i}`} className="py-2 text-sm">
              Learner {r.code}: {r.status} reading.
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
