import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import guidesFile from "@/content/guides.json";

interface Guide {
  slug: string;
  title: string;
  concern: string;
  observable_behaviours: string[];
  things_to_try_now: string[];
}

function getCategoryInfo(slug: string): { label: string; tagClass: string; icon: string } {
  switch (slug) {
    case "reading-difficulties":
      return {
        label: "Reading & Decoding",
        tagClass: "bg-pine/10 text-pine border-pine/30",
        icon: "📖",
      };
    case "attention-and-executive-function":
      return {
        label: "Attention & Focus",
        tagClass: "bg-marigold/15 text-ink border-marigold/40",
        icon: "⏱️",
      };
    case "autism-communication-and-sensory":
      return {
        label: "Autism & Sensory Needs",
        tagClass: "bg-pine/10 text-pine border-pine/30",
        icon: "🧩",
      };
    case "mathematics-number-sense":
      return {
        label: "Math & Number Sense",
        tagClass: "bg-marigold/15 text-ink border-marigold/40",
        icon: "🔢",
      };
    case "learning-in-a-second-language":
      return {
        label: "Multilingual Learners",
        tagClass: "bg-dusk/15 text-ink border-dusk/30",
        icon: "🌍",
      };
    case "speech-and-language":
      return {
        label: "Speech & Communication",
        tagClass: "bg-dusk/15 text-ink border-dusk/30",
        icon: "🗣️",
      };
    case "writing-and-motor":
      return {
        label: "Writing & Fine Motor",
        tagClass: "bg-madder/10 text-madder border-madder/30",
        icon: "✍️",
      };
    case "anxiety-and-fatigue":
      return {
        label: "Anxiety & Environment",
        tagClass: "bg-dusk/15 text-ink border-dusk/30",
        icon: "🌿",
      };
    default:
      return {
        label: "Classroom Support",
        tagClass: "bg-mist text-ink border-rule",
        icon: "📋",
      };
  }
}

export default async function GuidesPage() {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const guides = (guidesFile as { guides: Guide[] }).guides;

  return (
    <main className="page-container py-12">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pine/10 text-pine mb-3">
          <span>Inclusive Classroom Guides</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-ink">
          Classroom Concern Guides
        </h1>
        <p className="mt-3 text-base text-ink/70 reading">
          Practical, evidence-grounded observation guides for teachers. Designed to explore observable patterns,
          rule out environmental or language explanations, and provide immediate classroom adjustments to try.
        </p>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((g) => {
          const category = getCategoryInfo(g.slug);
          return (
            <div
              key={g.slug}
              className="flex flex-col justify-between rounded-xl border border-rule bg-paper p-6 shadow-sm hover:shadow-md hover:border-pine/40 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${category.tagClass}`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.label}</span>
                  </span>
                  <span className="text-[11px] text-ink/40 font-mono">v1</span>
                </div>

                <h2 className="font-serif text-xl font-bold text-ink leading-snug hover:text-pine transition-colors">
                  <Link href={`/guides/${g.slug}`}>{g.title}</Link>
                </h2>

                <p className="mt-2.5 text-xs text-ink/70 leading-relaxed line-clamp-2">
                  {g.concern}
                </p>

                {/* What to observe teaser */}
                <div className="mt-4 pt-3 border-t border-rule/60">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                    Observable Signs
                  </span>
                  <ul className="mt-1.5 space-y-1 text-xs text-ink/80">
                    {g.observable_behaviours.slice(0, 2).map((b, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-pine mt-0.5 shrink-0">•</span>
                        <span className="line-clamp-1">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Thing to try teaser */}
                {g.things_to_try_now && g.things_to_try_now.length > 0 ? (
                  <div className="mt-3 pt-2.5 border-t border-rule/40">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-pine">
                      Try First
                    </span>
                    <p className="mt-1 text-xs text-ink/75 line-clamp-1">
                      {g.things_to_try_now[0]}
                    </p>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 pt-4 border-t border-rule">
                <Link
                  href={`/guides/${g.slug}`}
                  className="inline-flex items-center justify-between w-full text-xs font-semibold text-pine hover:underline"
                >
                  <span>Open Full Guide</span>
                  <svg
                    className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-modal Accommodation Suite Illustration */}
      <section className="mt-14 rounded-2xl border border-rule bg-paper p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-rule">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-pine">Practical Classroom Tools</span>
            <h2 className="font-serif text-2xl font-bold text-ink mt-0.5">
              Multi-Modal Accommodation Architecture
            </h2>
          </div>
          <Link
            href="/resources"
            className="text-xs font-semibold text-pine hover:underline self-start sm:self-auto"
          >
            Browse all reviewed resources →
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-rule/70 bg-daylight/30">
          <Image
            src="/images/inclusive-classroom.svg"
            alt="Classroom multi-modal accommodation suite"
            width={800}
            height={420}
            className="w-full h-auto object-contain"
          />
        </div>
      </section>

      {/* Safeguarding Alert Card */}
      <div className="mt-12 rounded-xl bg-mist/60 border border-rule p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-pine/15 flex items-center justify-center text-pine shrink-0 font-serif font-bold text-lg">
          i
        </div>
        <div>
          <h3 className="font-semibold text-sm text-ink">Safeguarding & Diagnostic Boundaries</h3>
          <p className="mt-1 text-xs text-ink/70 leading-relaxed reading">
            These guides assist teachers in noting observable classroom behaviours, checking alternative explanations,
            and trying immediate adjustments. They are not screening batteries or clinical diagnostic tools. When
            a persistent pattern impairs learning despite structured support, refer the evidence portfolio to a
            qualified specialist.
          </p>
        </div>
      </div>
    </main>
  );
}
