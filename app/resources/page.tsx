import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const all = await getRepository().listResources();
  const topics = Array.from(new Set(all.flatMap((r) => r.topics))).sort();
  const active = searchParams.topic ?? "";
  const shown = active ? all.filter((r) => r.topics.includes(active)) : all;

  return (
    <main className="page-container py-12">
      {/* Page Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-3">
          <span>Curated Inclusive Education Guidance</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Inclusive Education Resource Library
        </h1>
        <p className="mt-3 text-base text-ink/70 reading">
          Curated guidance from recognised international bodies, dyslexia associations, and educational charities.
          Every resource is reviewed by educators before being surfaced in AI investigation reports.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 p-4 rounded-xl border border-rule bg-paper shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-ink/60 uppercase tracking-wider mr-1">
              Filter:
            </span>
            <Link
              href="/resources"
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !active
                  ? "bg-pine text-white"
                  : "bg-mist/70 text-ink/80 hover:bg-mist"
              }`}
            >
              All Topics ({all.length})
            </Link>
            {topics.map((t) => (
              <Link
                key={t}
                href={`/resources?topic=${encodeURIComponent(t)}`}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors capitalize ${
                  active === t
                    ? "bg-pine text-white"
                    : "bg-mist/70 text-ink/80 hover:bg-mist"
                }`}
              >
                {t.replace(/_/g, " ")}
              </Link>
            ))}
          </div>

          <div className="text-xs text-ink/50">
            Showing {shown.length} {shown.length === 1 ? "resource" : "resources"}
          </div>
        </div>
      </div>

      {/* Resource Cards Grid */}
      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-rule p-12 text-center bg-paper">
          <p className="text-sm font-semibold text-ink">No resources found for this topic</p>
          <p className="mt-1 text-xs text-ink/60">Try selecting another topic filter above.</p>
          <Link
            href="/resources"
            className="mt-4 inline-block rounded-md bg-pine px-4 py-2 text-xs font-semibold text-white"
          >
            Clear Filter
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shown.map((r) => (
            <div
              key={r.id}
              className="flex flex-col justify-between rounded-xl border border-rule bg-paper p-6 shadow-sm hover:shadow-md hover:border-pine/40 transition-all duration-200"
            >
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-mist text-ink border border-rule">
                    {r.publisher}
                  </span>
                  <span className="text-[11px] font-mono text-ink/50 uppercase">
                    {r.type} • {r.language.toUpperCase()}
                  </span>
                </div>

                <h2 className="font-serif text-xl font-bold text-ink leading-snug">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-pine transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{r.title}</span>
                    <svg className="w-4 h-4 opacity-40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </h2>

                <p className="mt-3 text-xs text-ink/75 leading-relaxed">{r.summary}</p>

                {/* Practical Action Box */}
                <div className="mt-4 p-3.5 rounded-lg bg-pine/5 border border-pine/20">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-pine block mb-1">
                    Try this week in class
                  </span>
                  <p className="text-xs text-ink/90 font-medium">{r.practical_action}</p>
                </div>

                {/* Topic tags */}
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {r.topics.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded bg-daylight text-ink/60 border border-rule/50 capitalize"
                    >
                      {tag.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-rule flex items-center justify-between">
                <span className="text-[11px] text-ink/50 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-pine inline-block" />
                  <span>Reviewed resource</span>
                </span>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded bg-mist/80 px-3 py-1.5 text-xs font-semibold text-ink hover:bg-pine hover:text-white transition-colors"
                >
                  Open Source ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
