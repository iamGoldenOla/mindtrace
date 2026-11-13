import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";
import { NewLearnerForm } from "./new-learner-form";

export default async function LearnersPage() {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const repo = getRepository();
  const learners = await repo.listLearnersForUser(user.id);

  const learnersWithStats = await Promise.all(
    learners.map(async (l) => {
      const [attempts, investigations, observations] = await Promise.all([
        repo.listAttemptsByLearner(l.id),
        repo.listInvestigationsByLearner(l.id),
        repo.listObservations(l.id),
      ]);
      return {
        ...l,
        attemptCount: attempts.length,
        investigationCount: investigations.length,
        observationCount: observations.length,
        recentAttempt: attempts[0] ?? null,
      };
    })
  );

  const totalAttempts = learnersWithStats.reduce((sum, l) => sum + l.attemptCount, 0);
  const totalInvestigations = learnersWithStats.reduce((sum, l) => sum + l.investigationCount, 0);

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-rule">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pine mb-1">
            <span className="w-2 h-2 rounded-full bg-pine"></span>
            Classroom Roster &amp; Inclusion Intelligence
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">Learners</h1>
          <p className="mt-2 text-sm text-ink/75 max-w-2xl leading-relaxed">
            Synthetic learner profiles only. Track speech latencies, record objective classroom observations,
            and run verified AI investigations with zero clinical delays.
          </p>
        </div>

        {/* Quick summary badges */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-paper border border-rule shadow-xs text-center">
            <span className="block text-xl font-bold text-ink">{learners.length}</span>
            <span className="text-[11px] text-ink/60 uppercase tracking-wider font-medium">Learners</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-paper border border-rule shadow-xs text-center">
            <span className="block text-xl font-bold text-pine">{totalAttempts}</span>
            <span className="text-[11px] text-ink/60 uppercase tracking-wider font-medium">Readings</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-paper border border-rule shadow-xs text-center">
            <span className="block text-xl font-bold text-rust">{totalInvestigations}</span>
            <span className="text-[11px] text-ink/60 uppercase tracking-wider font-medium">Investigations</span>
          </div>
        </div>
      </div>

      {/* Safeguard banner */}
      <div className="my-6 p-4 rounded-xl bg-daylight/60 border border-rule/70 flex items-start gap-3 text-xs text-ink/80">
        <span className="text-base">🛡️</span>
        <div className="leading-relaxed">
          <span className="font-semibold text-ink">Strict Non-Diagnostic Safeguard:</span> All profiles use anonymous
          codes. Never enter personally identifying information (PII). MINDTRACE is designed to identify observable
          classroom barriers and suggest educational accommodations, not assign clinical diagnoses.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Learners Grid (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-serif text-xl font-bold text-ink">Active Profiles ({learners.length})</h2>
            <span className="text-xs text-ink/60">Ordered by date created</span>
          </div>

          {learnersWithStats.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-rule bg-paper">
              <span className="text-3xl block mb-2">🌱</span>
              <h3 className="font-serif text-lg font-bold text-ink">No learners in roster yet</h3>
              <p className="mt-1 text-xs text-ink/70 max-w-sm mx-auto">
                Add your first synthetic learner profile using the form, or load the seeded demo classroom.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {learnersWithStats.map((l) => (
                <div
                  key={l.id}
                  className="rounded-xl border border-rule bg-paper p-5 shadow-xs hover:shadow-md hover:border-pine/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pine/10 border border-pine/30 text-pine font-bold flex items-center justify-center text-sm">
                          {l.code.slice(0, 3)}
                        </div>
                        <div>
                          <h3 className="font-serif font-bold text-ink text-base">Learner {l.code}</h3>
                          <span className="text-xs text-ink/60">
                            {l.stage || "Stage unassigned"} • {l.assessment_language || "en-GB"}
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-daylight text-ink/75 border border-rule">
                        Active
                      </span>
                    </div>

                    {/* Stats pills */}
                    <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 rounded-lg bg-daylight/50 border border-rule/50 text-center text-xs">
                      <div>
                        <span className="block font-bold text-ink">{l.attemptCount}</span>
                        <span className="text-[10px] text-ink/60">Readings</span>
                      </div>
                      <div>
                        <span className="block font-bold text-ink">{l.investigationCount}</span>
                        <span className="text-[10px] text-ink/60">Cases</span>
                      </div>
                      <div>
                        <span className="block font-bold text-ink">{l.observationCount}</span>
                        <span className="text-[10px] text-ink/60">Obs</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-rule/60 flex items-center justify-between gap-2">
                    <Link
                      href={`/learners/${l.id}/read`}
                      className="px-3 py-1.5 rounded-lg bg-pine/10 hover:bg-pine/20 text-pine text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <span>🎙️</span>
                      <span>Start Reading</span>
                    </Link>
                    <Link
                      href={`/learners/${l.id}`}
                      className="px-3 py-1.5 rounded-lg bg-daylight hover:bg-rule/40 text-ink text-xs font-medium border border-rule transition-colors"
                    >
                      Open Profile →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Learner Form (Right 1 col) */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-rule bg-paper p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">➕</span>
              <h2 className="font-serif text-lg font-bold text-ink">Add Synthetic Learner</h2>
            </div>
            <p className="text-xs text-ink/70 leading-relaxed mb-4">
              Create a new learner profile using an anonymous code. Stage and language can be customized anytime.
            </p>

            <NewLearnerForm />

            <div className="mt-6 pt-4 border-t border-rule text-xs text-ink/60 space-y-2">
              <span className="font-semibold text-ink block">Synthetic Code Tips:</span>
              <p>• Use randomized IDs like <code className="bg-daylight px-1 py-0.5 rounded">L-0042</code></p>
              <p>• Never use real child names, initials, or birthdays</p>
              <p>• RLS guarantees only your account can see this record</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}