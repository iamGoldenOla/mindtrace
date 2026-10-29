import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { getRepository } from "@/lib/db";
import { CorrectionForm } from "./correction-form";

export default async function AttemptPage({ params }: { params: { id: string } }) {
  const user = await getDevUser();
  if (!user) redirect("/sign-in");
  const repo = getRepository();
  const attempt = await repo.getAttempt(params.id);
  if (!attempt) notFound();
  try {
    await requireLearnerAccess(user.id, attempt.learner_id);
  } catch {
    notFound();
  }
  const learner = await repo.getLearner(attempt.learner_id);
  const definition = await repo.getDefinition(attempt.definition_id);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <p>
        {learner ? (
          <Link className="underline" href={`/learners/${learner.id}`}>
            Learner {learner.code}
          </Link>
        ) : null}
      </p>
      <h1 className="mt-2 font-serif text-3xl">
        Reading: Form {definition?.form ?? "?"} ({attempt.condition})
      </h1>
      <p className="mt-2 text-sm">
        Status: {attempt.status}; transcription: {attempt.asr_status ?? "not run yet"}.
      </p>
      {attempt.asr_status === "failed" ? (
        <p role="alert" className="mt-4 rounded border border-madder p-3">
          The recording could not be transcribed. Your attempt was kept. Try
          recording again, or type what you heard below.
        </p>
      ) : null}
      {attempt.asr_status === "empty" ? (
        <p role="alert" className="mt-4 rounded border border-dusk p-3">
          The transcript came back empty. Type what you heard below.
        </p>
      ) : null}
      <h2 className="mt-6 font-serif text-2xl">Transcript</h2>
      {attempt.transcript === null ? (
        <p className="mt-2">No transcript yet.</p>
      ) : (
        <p className="mt-2 rounded bg-paper p-4">{attempt.transcript}</p>
      )}
      {attempt.transcript_corrected !== null ? (
        <>
          <h2 className="mt-6 font-serif text-2xl">Teacher correction</h2>
          <p className="mt-2 rounded bg-paper p-4">{attempt.transcript_corrected}</p>
        </>
      ) : null}
      <h2 className="mt-6 font-serif text-2xl">Correct the transcript</h2>
      <p className="mt-1 text-sm">
        Speech recognition on reading aloud is imperfect. Fix mistakes here;
        corrections are recorded as such.
      </p>
      <CorrectionForm attemptId={attempt.id} initial={attempt.transcript_corrected ?? attempt.transcript ?? ""} />
    </main>
  );
}
