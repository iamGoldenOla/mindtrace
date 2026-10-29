import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import guidesFile from "@/content/guides.json";

export default async function GuidesPage() {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const guides = (guidesFile as { guides: { slug: string; title: string; concern: string }[] }).guides;
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl">Concern guides</h1>
      <p className="mt-2">
        Written guidance for common classroom concerns. Educational
        observations only, never diagnoses.
      </p>
      <ul className="mt-4 divide-y divide-rule border-y border-rule">
        {guides.map((g) => (
          <li key={g.slug} className="py-3">
            <Link className="underline" href={`/guides/${g.slug}`}>
              {g.title}
            </Link>
            <p className="text-sm">{g.concern}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
