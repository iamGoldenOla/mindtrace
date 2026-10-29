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

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      <ul className="mt-2 list-disc pl-6">
        {items.map((x, i) => (
          <li key={i} className="mt-1">
            {x}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const guides = (guidesFile as { guides: Guide[] }).guides;
  const guide = guides.find((g) => g.slug === params.slug);
  if (!guide) notFound();
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p>
        <Link className="underline" href="/guides">
          All guides
        </Link>
      </p>
      <h1 className="mt-2 font-serif text-3xl">{guide.title}</h1>
      <p className="mt-2">{guide.concern}</p>
      <Section title="What you might see" items={guide.observable_behaviours} />
      <Section title="Questions about the context" items={guide.context_questions} />
      <Section title="Other explanations to weigh first" items={guide.alternative_explanations} />
      <Section title="Things to try now" items={guide.things_to_try_now} />
      <Section title="What to record" items={guide.what_to_record} />
      <section className="mt-6">
        <h2 className="font-serif text-2xl">How to judge whether it helped</h2>
        <p className="mt-2">{guide.how_to_judge}</p>
      </section>
      <section className="mt-6">
        <h2 className="font-serif text-2xl">When to seek more help</h2>
        <p className="mt-2">{guide.when_to_seek_help}</p>
      </section>
      <p className="mt-6 border-t border-rule pt-4 text-sm">{guide.non_diagnostic_statement}</p>
    </main>
  );
}
