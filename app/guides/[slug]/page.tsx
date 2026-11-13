import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import guidesFile from "@/content/guides.json";

interface Guide {
  slug: string;
  title: string;
  concern: string;
  observable_behaviours: string[];
  context_questions: string[];
  alternative_explanations: string[];
  things_to_try_now: string[];
  what_to_record: string[];
  how_to_judge: string;
  when_to_seek_help: string;
  non_diagnostic_statement: string;
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const guides = (guidesFile as { guides: Guide[] }).guides;
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  return (
    <main className="page-container py-12 max-w-4xl">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/guides"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pine hover:underline"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to All Concern Guides</span>
        </Link>
      </nav>

      {/* Guide Header */}
      <div className="border-b border-rule pb-6 mb-8">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-3">
          Classroom Observation Brief
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          {guide.title}
        </h1>
        <div className="mt-3 p-4 rounded-lg bg-paper border border-rule/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 block mb-1">
            Focus Concern
          </span>
          <p className="text-sm font-medium text-ink leading-relaxed">{guide.concern}</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Section 1: Observable Behaviours */}
        <section className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded bg-pine/15 flex items-center justify-center text-xs font-bold text-pine">
              1
            </span>
            <h2 className="font-serif text-xl font-bold text-ink">What You Might Observe</h2>
          </div>
          <p className="text-xs text-ink/60 mb-3">
            Specific, observable classroom actions. Record factual occurrences rather than general labels.
          </p>
          <ul className="space-y-2 text-sm text-ink/90">
            {guide.observable_behaviours.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-pine font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 2: Questions about Context */}
        <section className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded bg-pine/15 flex items-center justify-center text-xs font-bold text-pine">
              2
            </span>
            <h2 className="font-serif text-xl font-bold text-ink">Context Questions to Ask First</h2>
          </div>
          <ul className="space-y-2 text-sm text-ink/90">
            {guide.context_questions.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-marigold font-bold mt-0.5">?</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 3: Alternative Explanations */}
        <section className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded bg-pine/15 flex items-center justify-center text-xs font-bold text-pine">
              3
            </span>
            <h2 className="font-serif text-xl font-bold text-ink">Alternative Explanations to Weigh</h2>
          </div>
          <p className="text-xs text-ink/60 mb-3">
            Always explore environmental, language, or fatigue explanations before considering a learning barrier.
          </p>
          <ul className="space-y-2 text-sm text-ink/90">
            {guide.alternative_explanations.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-dusk font-bold mt-0.5">→</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 4: Things to Try Now */}
        <section className="rounded-xl border-2 border-pine/30 bg-pine/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded bg-pine flex items-center justify-center text-xs font-bold text-white">
              4
            </span>
            <h2 className="font-serif text-xl font-bold text-pine">Immediate Classroom Adjustments</h2>
          </div>
          <p className="text-xs text-pine/80 mb-3 font-medium">
            Evidence-based classroom accommodations to implement immediately without clinical delays.
          </p>
          <ul className="space-y-2.5 text-sm text-ink font-medium">
            {guide.things_to_try_now.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-pine text-white flex items-center justify-center text-[10px] mt-0.5 shrink-0">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Section 5: What to Record */}
        <section className="rounded-xl border border-rule bg-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded bg-pine/15 flex items-center justify-center text-xs font-bold text-pine">
              5
            </span>
            <h2 className="font-serif text-xl font-bold text-ink">What to Record in MINDTRACE</h2>
          </div>
          <ul className="space-y-2 text-sm text-ink/90">
            {guide.what_to_record.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-pine font-bold mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Evaluation and Referral Guidance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-rule bg-paper p-5">
            <h3 className="font-serif text-lg font-bold text-ink mb-2">How to Judge Whether it Helped</h3>
            <p className="text-xs text-ink/80 leading-relaxed">{guide.how_to_judge}</p>
          </div>

          <div className="rounded-xl border border-marigold/40 bg-marigold/10 p-5">
            <h3 className="font-serif text-lg font-bold text-ink mb-2">When to Seek Specialist Referral</h3>
            <p className="text-xs text-ink/80 leading-relaxed">{guide.when_to_seek_help}</p>
          </div>
        </div>
      </div>

      {/* Footer non-diagnostic statement */}
      <div className="mt-10 pt-4 border-t border-rule text-xs text-ink/60 text-center">
        {guide.non_diagnostic_statement}
      </div>
    </main>
  );
}
