import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { RunInvestigationButton } from "./run-investigation-button";
import { SupportSection } from "./support-section";
import { LinkAttemptForm } from "./link-attempt-form";

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
  const learnerAttempts = await repo.listAttemptsByLearner(investigation.learner_id);
  const unlinkedAttempts = learnerAttempts
    .filter((a) => !attemptIds.includes(a.id))
    .map((a) => ({
      id: a.id,
      condition: a.condition,
      status: a.status,
      started_at: a.started_at,
    }));
  const reports = await repo.listReportsByInvestigation(params.id);

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink/60 mb-6">
        <Link href="/learners" className="hover:text-pine transition-colors">
          Learners
        </Link>
        <span>/</span>
        {learner ? (
          <Link href={`/learners/${learner.id}`} className="hover:text-pine transition-colors">
            Learner {learner.code}
          </Link>
        ) : null}
        <span>/</span>
        <span className="font-semibold text-ink">Investigation</span>
      </nav>

      {/* Investigation Header Card */}
      <div className="rounded-2xl border border-rule bg-paper p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-rule">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pine">
            <span className="w-2 h-2 rounded-full bg-pine"></span>
            Case Investigation
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-daylight text-ink border border-rule uppercase tracking-wider">
              Status: {investigation.status}
            </span>
            <span className="text-xs text-ink/60">
              {investigation.created_at?.slice(0, 10)}
            </span>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider block mb-1">
            Teacher Concern
          </span>
          <p className="font-serif text-xl sm:text-2xl text-ink font-semibold leading-snug">
            &ldquo;{investigation.concern}&rdquo;
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Evidence Linked Section */}
        <section className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <div>
              <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                <span>📎</span> Linked Reading Attempts ({attempts.length})
              </h2>
              <p className="text-xs text-ink/65 mt-0.5">
                The Meta AI investigation reasons exclusively across evidence from these linked attempts.
              </p>
            </div>
            {learner ? (
              <Link
                href={`/learners/${learner.id}/read`}
                className="text-xs font-semibold text-pine hover:underline"
              >
                + Record new reading
              </Link>
            ) : null}
          </div>

          {attempts.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-rule bg-daylight/40 my-4">
              <p className="text-xs text-ink/70">
                No attempts currently linked. Select from previous readings below to provide evidence for the AI agent.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-rule/70 my-3">
              {attempts.map((a) => (
                <div
                  key={a.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-daylight/30 px-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded bg-pine/10 border border-pine/30 text-pine font-bold text-xs flex items-center justify-center">
                      {a.condition === "baseline" ? "B" : "S"}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-ink capitalize block">
                        Condition: {a.condition}
                      </span>
                      <span className="text-[11px] text-ink/60">
                        Status: {a.status} • Started {a.started_at?.slice(0, 10)}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/attempts/${a.id}`}
                    className="px-3 py-1 rounded border border-rule hover:border-pine/50 bg-paper text-xs font-medium text-ink hover:text-pine transition-all"
                  >
                    View Attempt Trace →
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-rule/70">
            <LinkAttemptForm
              investigationId={investigation.id}
              unlinkedAttempts={unlinkedAttempts}
            />
          </div>
        </section>

        {/* Run Investigation Execution Card */}
        <section className="rounded-2xl border border-pine/30 bg-pine/5 p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                <span>🤖</span> Meta AI Agent Pipeline
              </h2>
              <p className="text-xs text-ink/75 mt-1 max-w-xl leading-relaxed">
                Invokes <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-pine font-bold">muse-spark-1.3</code> to
                synthesize teacher observations and word latencies. Every claim is strictly validated by an automated citation guard.
              </p>
            </div>
            <RunInvestigationButton investigationId={investigation.id} />
          </div>
        </section>

        {/* Support Section Accommodations */}
        <SupportSection investigationId={investigation.id} learnerId={investigation.learner_id} />

        {/* Investigation Reports */}
        <section className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-rule">
            <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
              <span>📄</span> Generated Reports ({reports.length})
            </h2>
            <span className="text-xs text-ink/60">Automated verification status</span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-rule bg-daylight/40 mt-4">
              <span className="text-2xl block mb-2">📋</span>
              <p className="text-sm font-semibold text-ink">No reports generated yet</p>
              <p className="text-xs text-ink/65 mt-1 max-w-sm mx-auto">
                Click &ldquo;Run investigation&rdquo; above to synthesize the linked attempts and generate your non-clinical findings.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-rule/70 mt-3">
              {reports.map((r) => {
                const v = r.verification as { passed?: boolean };
                return (
                  <div
                    key={r.id}
                    className="py-3.5 flex items-center justify-between gap-3 hover:bg-daylight/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          v.passed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {v.passed ? "✓" : "⚠️"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink">
                            {v.passed ? "Verification Passed" : "Verification Incomplete"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-daylight text-ink/80 border border-rule capitalize">
                            Review: {r.review_status}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink/60">
                          Created {r.created_at?.slice(0, 16).replace("T", " ")}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/reports/${r.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-pine text-white text-xs font-semibold hover:bg-pine/90 transition-all flex items-center gap-1"
                    >
                      <span>Open Report</span>
                      <span>→</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}