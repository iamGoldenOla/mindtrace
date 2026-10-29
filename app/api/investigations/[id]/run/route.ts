import { NextResponse } from "next/server";
import { getRepository } from "@/lib/db";
import { requireDevUser } from "@/lib/auth/dev";
import { requireLearnerAccess } from "@/lib/auth/access";
import { runInvestigation, type ProgressStage } from "@/lib/ai/agent";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const user = await requireDevUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  const repo = getRepository();
  const investigation = await repo.getInvestigation(params.id);
  if (!investigation) return NextResponse.json({ error: "Not found." }, { status: 404 });
  try {
    await requireLearnerAccess(user.id, investigation.learner_id, true);
  } catch {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: Record<string, unknown>) => {
        controller.enqueue(new TextEncoder().encode(JSON.stringify(obj) + "\n"));
      };
      try {
        const outcome = await runInvestigation(params.id, async (stage: ProgressStage) => {
          send({ stage });
        });
        send({ done: true, reportId: outcome.reportId, passed: outcome.passed, problems: outcome.problems });
      } catch (err) {
        const message = err instanceof Error ? err.message : "The investigation failed.";
        const billing =
          /status 4(01|02|03)/.test(message) || /billing|credit|quota/i.test(message);
        send({
          done: true,
          reportId: null,
          passed: false,
          problems: [
            billing
              ? "The model call failed. Check the model key and billing, then try again. No data was lost."
              : "The investigation could not finish. The evidence is kept. Try again.",
          ],
        });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-cache" },
  });
}
