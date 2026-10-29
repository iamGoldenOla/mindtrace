import Link from "next/link";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";
import { SeedButton } from "./seed-button";

// Static example strip: first words of Form A with the seeded L-0001
// pattern (hit for hat). Synthetic data, labelled as such.
const EXAMPLE: { word: string; outcome: "match" | "substitution"; heard?: string }[] = [
  { word: "Sam", outcome: "match" },
  { word: "has", outcome: "match" },
  { word: "a", outcome: "match" },
  { word: "red", outcome: "match" },
  { word: "hat", outcome: "substitution", heard: "hit" },
  { word: "The", outcome: "match" },
  { word: "hat", outcome: "match" },
  { word: "is", outcome: "match" },
];

function ExampleTrace() {
  return (
    <figure className="mt-4 rounded bg-paper p-5">
      <div className="flex flex-wrap gap-x-2 gap-y-4" aria-label="Example word-by-word trace">
        {EXAMPLE.map((w, i) => (
          <span
            key={i}
            className={`min-w-[44px] px-1 pb-1 ${
              w.outcome === "match" ? "border-t-4 border-pine" : "border-t-4 border-marigold"
            }`}
          >
            {w.heard ? <span className="block text-xs text-madder">〈{w.heard}〉</span> : null}
            <span>{w.word}</span>
          </span>
        ))}
      </div>
      <figcaption className="mt-3 text-sm">
        Example Trace from synthetic data: every word is evidence. The full
        Trace links each word to the report sentences that cite it.
      </figcaption>
    </figure>
  );
}

function Landing() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="font-serif text-4xl leading-tight">
        When a child stumbles over words, know what to try next.
      </h1>
      <p className="mt-4 text-lg leading-relaxed">
        A teacher watches a learner hesitate over a word and has no idea why.
        Most schools have no specialist to ask. MINDTRACE is an AI agent that
        helps teachers investigate with real evidence, try a classroom support,
        and verify whether it worked.
      </p>
      <p className="mt-4">
        <Link className="rounded bg-pine px-6 py-3 text-white" href="/sign-in">
          Sign in
        </Link>
      </p>

      <h2 className="mt-12 font-serif text-2xl">How it works</h2>
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
