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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl">Resource library</h1>
      <p className="mt-2">
        Every item is reviewed by a person before it appears in a report.
        Items below marked unreviewed are not used in reports.
      </p>
      <form method="get" className="mt-4 flex items-center gap-2">
        <label>
          Topic{" "}
          <select name="topic" defaultValue={active} className="rounded border border-rule bg-paper px-3 py-2">
            <option value="">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="rounded bg-pine px-4 py-2 text-white">
          Filter
        </button>
      </form>
      {shown.length === 0 ? (
        <p className="mt-4">No resources on this topic yet.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {shown.map((r) => (
            <li key={r.id} className="border-t border-rule pt-3">
              <p className="font-semibold">
                <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                  {r.title}
                </a>
              </p>
              <p className="text-sm">
                {r.publisher}; {r.type}; {r.language}; status: {r.review_status}.
              </p>
              <p className="mt-1 text-sm">{r.summary}</p>
              <p className="mt-1 text-sm">Try this week: {r.practical_action}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
