import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { ReadAloudFlow } from "./read-aloud-flow";

export default async function ReadPage({ params }: { params: { id: string } }) {
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
  const definitions = await repo.listDefinitions();
  const forms = definitions
    .filter((d) => d.skill === "oral_reading")
    .map((d) => ({ form: d.form ?? "?", sentences: d.target.sentences }));
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="font-serif text-3xl">Read aloud: learner {learner.code}</h1>
      <p className="mt-2">
        A supervising adult stays with the learner. The recording is
        transcribed and then discarded. Nothing is kept but the transcript.
      </p>
      <ReadAloudFlow learnerId={learner.id} forms={forms} />
    </main>
  );
}
