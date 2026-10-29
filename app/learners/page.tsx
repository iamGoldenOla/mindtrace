import Link from "next/link";
import { redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { getRepository } from "@/lib/db";
import { NewLearnerForm } from "./new-learner-form";

export default async function LearnersPage() {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const learners = await getRepository().listLearnersForUser(user.id);
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="font-serif text-3xl">Learners</h1>
      <p className="mt-2">
        Synthetic learner profiles only. No real children&apos;s data.
      </p>
      {learners.length === 0 ? (
        <p className="mt-6">
          No learners yet. Add one below, or seed the demo data.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-rule border-y border-rule">
          {learners.map((l) => (
            <li key={l.id} className="flex items-center justify-between py-3">
              <span>
                Learner {l.code}
                {l.stage ? `, ${l.stage}` : ""}
              </span>
              <Link className="underline" href={`/learners/${l.id}`}>
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
      <h2 className="mt-10 font-serif text-2xl">Add a learner</h2>
      <NewLearnerForm />
    </main>
  );
}
