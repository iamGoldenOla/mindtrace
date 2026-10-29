import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { ObservationForm } from "./observation-form";
import { ConcernForm } from "./concern-form";
import { DeleteLearnerButton } from "./delete-learner-button";

export default async function LearnerPage({ params }: { params: { id: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  try {
    await requireLearnerAccess(user.id, params.id);
  } catch {
    notFound();
  }
  const repo = getRepository();
  const learner = await repo.getLearner(params.id);
  if (!learner) notFound();
  const observations = await repo.listObservations(params.id);
  const attempts = await repo.listAttemptsByLearner(params.id);
  const investigations = await repo.listInvestigationsByLearner(params.id);

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <p>
        <Link className="underline" href="/learners">
          All learners
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-3xl">Learner {learner.code}</h1>
      <p className="mt-2 text-sm">
        Stage: {learner.stage ?? "not set"}; language: {learner.assessment_language}.
      </p>

      <h2 className="mt-8 font-serif text-2xl">Record an observation</h2>
      <ObservationForm learnerId={learner.id} />

      <h2 className="mt-8 font-serif text-2xl">Observations</h2>
      {observations.length === 0 ? (
        <p className="mt-2">No observations yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {observations.map((o) => (
            <li key={o.id} className="border-t border-rule pt-3">
              <p>{o.behaviour}</p>
              <p className="mt-1 text-sm">
                {o.category ?? "general"}; source: {o.source}; {o.observed_on}
                {o.frequency ? `; ${o.frequency}` : ""}
                {o.context ? `; ${o.context}` : ""}
              </p>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-8 font-serif text-2xl">Record a concern</h2>
      <ConcernForm learnerId={learner.id} />

      <h2 className="mt-8 font-serif text-2xl">Reading attempts</h2>
      {attempts.length === 0 ? (
        <p className="mt-2">
          No readings yet.{" "}
          <Link className="underline" href={`/learners/${learner.id}/read`}>
            Start a baseline reading
          </Link>{" "}
          to see the Trace.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {attempts.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {a.condition}; {a.status}; started {a.started_at.slice(0, 10)}
              </span>
              <Link className="underline" href={`/attempts/${a.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3">
        <Link className="underline" href={`/learners/${learner.id}/read`}>
          Start a reading
        </Link>
      </p>

      <h2 className="mt-8 font-serif text-2xl">Investigations</h2>
      {investigations.length === 0 ? (
        <p className="mt-2">No investigations yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-rule border-y border-rule">
          {investigations.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {i.status}: {i.concern.slice(0, 60)}
              </span>
              <Link className="underline" href={`/investigations/${i.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-10 border-t border-rule pt-4">
        <DeleteLearnerButton learnerId={learner.id} code={learner.code} />
      </div>
    </main>
  );
}
