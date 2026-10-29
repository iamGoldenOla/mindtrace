import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { RunInvestigationButton } from "./run-investigation-button";
import { SupportSection } from "./support-section";

export default async function InvestigationPage({ params }: { params: { id: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const repo = getRepository();
  const investigation = await repo.getInvestigation(params.id);
  if (!investigation) notFound();
  try {
    await requireLearnerAccess(user.id, investigation.learner_id);
  } catch {
    notFound();
  }
  const learner = await repo.getLearner(investigation.learner_id);
  const attemptIds = await repo.listAttemptIds(params.id);
  const attempts = [];
  for (const aid of attemptIds) {
    const a = await repo.getAttempt(aid);
    if (a) attempts.push(a);
  }
  const reports = await repo.listReportsByInvestigation(params.id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p>
        {learner ? (
          <Link className="underline" href={`/learners/${learner.id}`}>
            Learner {learner.code}
          </Link>
        ) : null}
      </p>
      <h1 className="mt-2 font-serif text-3xl">Investigation</h1>
      <p className="mt-2">Concern: {investigation.concern}</p>
      <p className="mt-1 text-sm">Status: {investigation.status}.</p>
      <h2 className="mt-6 font-serif text-2xl">Evidence linked</h2>
      {attempts.length === 0 ? (
        <p className="mt-2">No attempts linked yet.</p>
      ) : (
        <ul className="mt-2 divide-y divide-rule border-y border-rule">
          {attempts.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                {a.condition}; {a.status}
              </span>
              <Link className="underline" href={`/attempts/${a.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-6">
        <RunInvestigationButton investigationId={investigation.id} />
      </div>
      <SupportSection investigationId={investigation.id} learnerId={investigation.learner_id} />
      <h2 className="mt-8 font-serif text-2xl">Reports</h2>
      {reports.length === 0 ? (
        <p className="mt-2">No reports yet. Run the investigation above.</p>
      ) : (
        <ul className="mt-2 divide-y divide-rule border-y border-rule">
          {reports.map((r) => {
            const v = r.verification as { passed?: boolean };
            return (
              <li key={r.id} className="flex items-center justify-between py-2 text-sm">
                <span>
                  {v.passed ? "Verified" : "Could not be verified"}; review: {r.review_status}
                </span>
                <Link className="underline" href={`/reports/${r.id}`}>
                  Open
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
