import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";

export default async function Home() {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
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
