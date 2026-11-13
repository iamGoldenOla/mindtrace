import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { ObservationForm } from "./observation-form";
import { ConcernForm } from "./concern-form";
import { DeleteLearnerButton } from "./delete-learner-button";
import { Timeline } from "./timeline";

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
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-ink/60 mb-6">
        <Link href="/learners" className="hover:text-pine transition-colors">
          ← All Learners
        </Link>
        <span>/</span>
        <span className="font-semibold text-ink">Learner {learner.code}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="rounded-2xl border border-rule bg-paper p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-pine/10 border border-pine/30 text-pine font-bold flex items-center justify-center text-xl shadow-xs">
            {learner.code.slice(0, 3)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
                Learner {learner.code}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pine/10 text-pine border border-pine/30">
                Active Profile
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink/70">
              <span className="inline-flex items-center gap-1">
                <span className="font-medium text-ink">Stage:</span> {learner.stage ?? "Not set"}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-medium text-ink">Language:</span> {learner.assessment_language}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <span className="font-medium text-ink">Created:</span> {learner.created_at?.slice(0, 10)}
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href={`/learners/${learner.id}/read`}
            className="px-5 py-2.5 rounded-xl bg-pine hover:bg-pine/90 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <span>🎙️</span>
            <span>Start Reading Session</span>
          </Link>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Evidence, Readings, and Investigations (2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Reading Attempts & The Trace */}
          <section className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-rule">
              <div>
                <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                  <span>📊</span> Reading Attempts &amp; The Trace
                </h2>
                <p className="text-xs text-ink/65 mt-0.5">
                  Countable speech latencies, substitution patterns, and baseline comparisons.
                </p>
              </div>
              <Link
                href={`/learners/${learner.id}/read`}
                className="text-xs font-semibold text-pine hover:underline"
              >
                + New reading
              </Link>
            </div>

            {attempts.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-rule bg-daylight/40 mt-4">
                <span className="text-2xl block mb-2">⏱️</span>
                <p className="text-sm font-semibold text-ink">No reading attempts recorded yet</p>
                <p className="text-xs text-ink/65 mt-1 max-w-sm mx-auto">
                  Run a 60-second oral reading probe to generate word-level latency tokens and acoustic traces.
                </p>
                <Link
                  href={`/learners/${learner.id}/read`}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-pine text-white text-xs font-semibold"
                >
                  Start baseline reading
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-rule/70 mt-3">
                {attempts.map((a) => (
                  <div
                    key={a.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-daylight/30 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-daylight border border-rule flex items-center justify-center text-xs font-bold text-ink">
                        {a.condition === "baseline" ? "B" : "S"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink capitalize">
                            Condition: {a.condition}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              a.status === "completed"
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : "bg-amber-50 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {a.status}
                          </span>
                        </div>
                        <span className="text-[11px] text-ink/60">
                          Started {a.started_at?.slice(0, 16).replace("T", " ")}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/attempts/${a.id}`}
                      className="px-3 py-1.5 rounded-lg border border-rule hover:border-pine/50 bg-paper text-xs font-medium text-ink hover:text-pine transition-all flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>View Trace</span>
                      <span>→</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Classroom Investigations */}
          <section className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-rule">
              <div>
                <h2 className="font-serif text-xl font-bold text-ink flex items-center gap-2">
                  <span>🔬</span> AI Classroom Investigations
                </h2>
                <p className="text-xs text-ink/65 mt-0.5">
                  Meta AI pattern analysis verified against 100% cited evidence IDs.
                </p>
              </div>
            </div>

            {investigations.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-rule bg-daylight/40 mt-4">
                <span className="text-2xl block mb-2">🔍</span>
                <p className="text-sm font-semibold text-ink">No investigations opened yet</p>
                <p className="text-xs text-ink/65 mt-1 max-w-sm mx-auto">
                  Submit a teacher concern on the right to open an evidence-backed inquiry.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-rule/70 mt-3">
                {investigations.map((i) => (
                  <div
                    key={i.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-daylight/30 px-2 rounded-lg transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-daylight text-ink border border-rule uppercase tracking-wider">
                          {i.status}
                        </span>
                        <span className="text-xs text-ink/60">
                          Created {i.created_at?.slice(0, 10)}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-ink line-clamp-2 max-w-md">
                        &ldquo;{i.concern}&rdquo;
                      </p>
                    </div>

                    <Link
                      href={`/investigations/${i.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-pine text-white text-xs font-semibold hover:bg-pine/90 transition-all flex items-center gap-1 self-start sm:self-auto"
                    >
                      <span>Open Case</span>
                      <span>→</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activity Timeline */}
          <section className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <h2 className="font-serif text-xl font-bold text-ink mb-4 flex items-center gap-2">
              <span>📅</span> Activity Timeline
            </h2>
            <Timeline learnerId={learner.id} />
          </section>
        </div>

        {/* Right Column: Record Inputs & Classroom Observation Log (1 col) */}
        <div className="space-y-6">
          {/* Observation Input Card */}
          <div className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <span>📝</span> Record Observation
            </h2>
            <p className="text-xs text-ink/70 mt-1 leading-relaxed">
              Note factual classroom observations (e.g. &ldquo;rubs eyes during board copy&rdquo;, &ldquo;distressed by loud transitions&rdquo;).
            </p>
            <ObservationForm learnerId={learner.id} />
          </div>

          {/* Teacher Concern Input Card */}
          <div className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
              <span>💡</span> Open an Investigation
            </h2>
            <p className="text-xs text-ink/70 mt-1 leading-relaxed">
              Phrase your specific pedagogical concern. Never label or presume a clinical condition.
            </p>
            <ConcernForm learnerId={learner.id} />
          </div>

          {/* Observations Log */}
          <div className="rounded-2xl border border-rule bg-paper p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-ink mb-3 flex items-center justify-between">
              <span>Classroom Notes</span>
              <span className="text-xs font-mono font-normal text-ink/60">
                ({observations.length})
              </span>
            </h2>

            {observations.length === 0 ? (
              <p className="text-xs text-ink/60 italic py-3">No observations recorded yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {observations.map((o) => (
                  <div
                    key={o.id}
                    className="p-3 rounded-xl bg-daylight/50 border border-rule/60 text-xs space-y-1.5"
                  >
                    <p className="text-ink font-medium leading-relaxed">{o.behaviour}</p>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-ink/60">
                      <span className="font-semibold text-pine uppercase tracking-wider">
                        {o.source.replace("_", " ")}
                      </span>
                      <span>•</span>
                      <span>{o.observed_on}</span>
                      {o.category ? (
                        <>
                          <span>•</span>
                          <span className="bg-paper px-1.5 py-0.5 rounded border border-rule">
                            {o.category}
                          </span>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className="p-4 rounded-xl border border-red-200 bg-red-50/40 text-xs">
            <span className="font-semibold text-red-900 block mb-1">Administrative Actions</span>
            <p className="text-red-800/80 mb-3">
              Permanently delete this synthetic learner profile, associated attempts, and reports.
            </p>
            <DeleteLearnerButton learnerId={learner.id} code={learner.code} />
          </div>
        </div>
      </div>
    </main>
  );
}