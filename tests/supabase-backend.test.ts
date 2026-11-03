import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { SupabaseRepository } from "../lib/db/supabase-repository";

// Live backend checks for the Supabase Repository. They need a real project
// with supabase/setup-live.sql applied (Parts 1-2, UUID tokens replaced) and
// the two teacher auth users created. Provide two env vars to run; otherwise
// the suite skips (never fake a pass).
//
//   SUPABASE_TEST_URL           e.g. https://<ref>.supabase.co
//   SUPABASE_TEST_SERVICE_KEY   the project's service_role key (never commit)
//
// The test creates one learner with a unique code, exercises the backend
// through it, then deletes it again, so the seeded demo data is untouched.

const url = process.env.SUPABASE_TEST_URL;
const service = process.env.SUPABASE_TEST_SERVICE_KEY;
const canRun = !!url && !!service;

const TEACHER_A = "teacher.a@example.test";
const TEACHER_B = "teacher.b@example.test";

describe.runIf(canRun)("supabase repository (live)", () => {
  it("round-trips a learner lifecycle and cascades the delete", async () => {
    const repo = new SupabaseRepository(
      createClient(url as string, service as string, {
        auth: { persistSession: false },
      }),
    );

    const teacherA = await repo.getUserByEmail(TEACHER_A.toUpperCase());
    expect(
      teacherA,
      "seed the live project first (supabase/setup-live.sql)",
    ).not.toBeNull();
    const teacherB = await repo.getUserByEmail(TEACHER_B);
    expect(teacherB).not.toBeNull();

    const code = `L-T${Date.now().toString(36).toUpperCase()}`;
    const learner = await repo.createLearner({
      code,
      pseudonym: null,
      stage: "Year 2",
      preferred_language: "en",
      assessment_language: "en",
      accessibility_prefs: {},
      created_by: teacherA!.id,
    });
    await repo.grantAccess({
      user_id: teacherA!.id,
      learner_id: learner.id,
      access_role: "owner",
      revoked_at: null,
    });

    try {
      // Owner sees it; the other teacher does not.
      expect(
        (await repo.listLearnersForUser(teacherA!.id)).map((l) => l.id),
      ).toContain(learner.id);
      expect(
        (await repo.listLearnersForUser(teacherB!.id)).map((l) => l.id),
      ).not.toContain(learner.id);
      expect(await repo.getAccess(teacherB!.id, learner.id)).toBeNull();

      const definition = await repo.getDefinitionBySlug("read-aloud-a");
      expect(definition).not.toBeNull();
      const inv = await repo.createInvestigation({
        learner_id: learner.id,
        concern: "Backend probe concern.",
        status: "open",
        created_by: teacherA!.id,
      });
      const attempt = await repo.createAttempt({
        learner_id: learner.id,
        definition_id: definition!.id,
        language: "en",
        condition: "baseline",
        support_strategy_id: null,
        status: "completed",
        asr_status: "seeded-synthetic",
        transcript: "Sam has a red hat.",
        transcript_corrected: null,
        evidence_version: null,
        completed_at: null,
        created_by: teacherA!.id,
      });
      await repo.linkAttempt(inv.id, attempt.id);
      await repo.replaceResponses(attempt.id, [
        {
          evidence_id: "E-probe-w00",
          item_ref: "w0",
          target: "Sam",
          observed: "Sam",
          outcome: "match",
          error_category: null,
          hints_used: 0,
          support_used: [],
          response_ms: null,
        },
      ]);
      const strategy = await repo.createStrategy({
        investigation_id: inv.id,
        catalog_key: "chunked-text",
        description: "Probe strategy.",
        target: null,
        rationale: null,
        start_date: "2026-11-03",
        status: "active",
        created_by: teacherA!.id,
      });
      const followup = await repo.createFollowup({
        support_strategy_id: strategy.id,
        baseline_attempt_id: attempt.id,
        followup_attempt_id: null,
        comparison: null,
        teacher_notes: null,
        decision: null,
      });

      // Dev session round-trip for the same teacher.
      const session = await repo.createDevSession(teacherA!.id);
      expect(await repo.getDevSession(session.token)).toMatchObject({
        user_id: teacherA!.id,
      });
      await repo.deleteDevSession(session.token);
      expect(await repo.getDevSession(session.token)).toBeNull();

      await repo.deleteLearner(learner.id, teacherA!.id);
      expect(await repo.getLearner(learner.id)).toBeNull();
      expect(await repo.getAccess(teacherA!.id, learner.id)).toBeNull();
      expect(await repo.listObservations(learner.id)).toHaveLength(0);
      expect(await repo.getInvestigation(inv.id)).toBeNull();
      expect(await repo.getAttempt(attempt.id)).toBeNull();
      expect(await repo.listResponses(attempt.id)).toHaveLength(0);
      expect(await repo.getStrategy(strategy.id)).toBeNull();
      expect(await repo.getFollowup(followup.id)).toBeNull();
    } finally {
      // Never leave the probe learner behind, even on failure.
      if (await repo.getLearner(learner.id)) {
        await repo.deleteLearner(learner.id, teacherA!.id);
      }
    }
  });
});

describe.skipIf(canRun)("supabase repository (no live project)", () => {
  it("records that live backend checks are pending", () => {
    expect(canRun).toBe(false);
  });
});
