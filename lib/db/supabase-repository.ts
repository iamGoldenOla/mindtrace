// Supabase-backed Repository for the live database.
// Same interface as LocalJsonRepository, so pages and routes are unchanged:
// getRepository() picks this backend when the Supabase service env vars are
// set, and the local JSON store otherwise. Server-only: constructed with the
// service-role client (lib/db/service.ts), which must never reach the browser.
// Row-level security stays enabled on every table; the service role bypasses
// RLS, so per-learner authorisation is enforced by requireLearnerAccess in
// routes and pages, exactly as with the local store.
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AssessmentDefinition,
  Attempt,
  AuditEvent,
  DbShape,
  DevSession,
  Followup,
  Investigation,
  Learner,
  LearnerAccess,
  Observation,
  Profile,
  Repository,
  Resource,
  ResponseRow,
  SupportStrategy,
  AiReport,
  AiRun,
} from "./repository";
import { newId, nowIso } from "./repository";

const NIL_UUID = "00000000-0000-0000-0000-000000000000";

interface PgError {
  message: string;
  code?: string;
}

type PgResult<T> = PromiseLike<{ data: T | null; error: PgError | null }>;

async function readOne<T>(q: PgResult<T>, op: string): Promise<T> {
  const { data, error } = await q;
  if (error || data === null || data === undefined) {
    throw new Error(`${op} failed: ${error?.message ?? "not found"}`);
  }
  return data;
}

async function readMaybe<T>(q: PgResult<T>, op: string): Promise<T | null> {
  const { data, error } = await q;
  if (error) throw new Error(`${op} failed: ${error.message}`);
  return data;
}

async function readMany<T>(q: PgResult<T[]>, op: string): Promise<T[]> {
  const { data, error } = await q;
  if (error) throw new Error(`${op} failed: ${error.message}`);
  return data ?? [];
}

async function write(q: PgResult<unknown>, op: string): Promise<void> {
  const { error } = await q;
  if (error) throw new Error(`${op} failed: ${error.message}`);
}

export class SupabaseRepository implements Repository {
  private db: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.db = client;
  }

  async getUserByEmail(email: string): Promise<Profile | null> {
    return readMaybe<Profile>(
      this.db
        .from("profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .maybeSingle(),
      "getUserByEmail",
    );
  }

  async getUserById(id: string): Promise<Profile | null> {
    return readMaybe<Profile>(
      this.db.from("profiles").select("*").eq("id", id).maybeSingle(),
      "getUserById",
    );
  }

  async listLearnersForUser(userId: string): Promise<Learner[]> {
    const grants = await readMany<LearnerAccess>(
      this.db
        .from("learner_access")
        .select("*")
        .eq("user_id", userId)
        .is("revoked_at", null),
      "listLearnersForUser",
    );
    const ids = grants.map((g) => g.learner_id);
    if (ids.length === 0) return [];
    return readMany<Learner>(
      this.db.from("learners").select("*").in("id", ids),
      "listLearnersForUser",
    );
  }

  async getLearner(id: string): Promise<Learner | null> {
    return readMaybe<Learner>(
      this.db.from("learners").select("*").eq("id", id).maybeSingle(),
      "getLearner",
    );
  }

  async createLearner(
    row: Omit<Learner, "id" | "created_at">,
  ): Promise<Learner> {
    return readOne<Learner>(
      this.db
        .from("learners")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createLearner",
    );
  }

  async deleteLearner(id: string, actorId: string): Promise<void> {
    // followups point at attempts with a restricting FK and are outside the
    // learners cascade tree, so remove them first; the learner delete then
    // cascades to access, observations, attempts, responses, investigations,
    // strategies, reports and runs.
    const invIds = (
      await readMany<Investigation>(
        this.db.from("investigations").select("*").eq("learner_id", id),
        "deleteLearner",
      )
    ).map((i) => i.id);
    if (invIds.length > 0) {
      const stratIds = (
        await readMany<SupportStrategy>(
          this.db
            .from("support_strategies")
            .select("*")
            .in("investigation_id", invIds),
          "deleteLearner",
        )
      ).map((s) => s.id);
      if (stratIds.length > 0) {
        await write(
          this.db
            .from("followups")
            .delete()
            .in("support_strategy_id", stratIds),
          "deleteLearner",
        );
      }
    }
    await write(this.db.from("learners").delete().eq("id", id), "deleteLearner");
    await write(
      this.db.from("audit_events").insert({
        id: newId(),
        actor_id: actorId,
        action: "learner.delete",
        record_type: "learner",
        record_id: id,
        created_at: nowIso(),
      }),
      "deleteLearner",
    );
  }

  async getAccess(
    userId: string,
    learnerId: string,
  ): Promise<LearnerAccess | null> {
    return readMaybe<LearnerAccess>(
      this.db
        .from("learner_access")
        .select("*")
        .eq("user_id", userId)
        .eq("learner_id", learnerId)
        .is("revoked_at", null)
        .maybeSingle(),
      "getAccess",
    );
  }

  async grantAccess(row: Omit<LearnerAccess, "granted_at">): Promise<void> {
    await write(
      this.db.from("learner_access").upsert(
        { ...row, granted_at: nowIso() },
        { onConflict: "user_id,learner_id" },
      ),
      "grantAccess",
    );
  }

  async listObservations(learnerId: string): Promise<Observation[]> {
    return readMany<Observation>(
      this.db
        .from("observations")
        .select("*")
        .eq("learner_id", learnerId)
        .order("observed_on", { ascending: false }),
      "listObservations",
    );
  }

  async createObservation(
    row: Omit<Observation, "id" | "created_at">,
  ): Promise<Observation> {
    return readOne<Observation>(
      this.db
        .from("observations")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createObservation",
    );
  }

  async listDefinitions(): Promise<AssessmentDefinition[]> {
    return readMany<AssessmentDefinition>(
      this.db.from("assessment_definitions").select("*").order("slug"),
      "listDefinitions",
    );
  }

  async getDefinitionBySlug(slug: string): Promise<AssessmentDefinition | null> {
    return readMaybe<AssessmentDefinition>(
      this.db
        .from("assessment_definitions")
        .select("*")
        .eq("slug", slug)
        .maybeSingle(),
      "getDefinitionBySlug",
    );
  }

  async getDefinition(id: string): Promise<AssessmentDefinition | null> {
    return readMaybe<AssessmentDefinition>(
      this.db
        .from("assessment_definitions")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
      "getDefinition",
    );
  }

  async getAttempt(id: string): Promise<Attempt | null> {
    return readMaybe<Attempt>(
      this.db.from("attempts").select("*").eq("id", id).maybeSingle(),
      "getAttempt",
    );
  }

  async listAttemptsByLearner(learnerId: string): Promise<Attempt[]> {
    return readMany<Attempt>(
      this.db
        .from("attempts")
        .select("*")
        .eq("learner_id", learnerId)
        .order("started_at", { ascending: false }),
      "listAttemptsByLearner",
    );
  }

  async createAttempt(
    row: Omit<Attempt, "id" | "started_at">,
  ): Promise<Attempt> {
    return readOne<Attempt>(
      this.db
        .from("attempts")
        .insert({ ...row, id: newId(), started_at: nowIso() })
        .select()
        .single(),
      "createAttempt",
    );
  }

  async updateAttempt(id: string, patch: Partial<Attempt>): Promise<Attempt> {
    return readOne<Attempt>(
      this.db.from("attempts").update(patch).eq("id", id).select().single(),
      "updateAttempt",
    );
  }

  async listResponses(attemptId: string): Promise<ResponseRow[]> {
    return readMany<ResponseRow>(
      this.db.from("responses").select("*").eq("attempt_id", attemptId),
      "listResponses",
    );
  }

  async replaceResponses(
    attemptId: string,
    rows: Omit<ResponseRow, "id" | "attempt_id">[],
  ): Promise<ResponseRow[]> {
    await write(
      this.db.from("responses").delete().eq("attempt_id", attemptId),
      "replaceResponses",
    );
    if (rows.length === 0) return [];
    return readMany<ResponseRow>(
      this.db
        .from("responses")
        .insert(
          rows.map((r) => ({ ...r, id: newId(), attempt_id: attemptId })),
        )
        .select(),
      "replaceResponses",
    );
  }

  async getInvestigation(id: string): Promise<Investigation | null> {
    return readMaybe<Investigation>(
      this.db.from("investigations").select("*").eq("id", id).maybeSingle(),
      "getInvestigation",
    );
  }

  async listInvestigationsByLearner(learnerId: string): Promise<Investigation[]> {
    return readMany<Investigation>(
      this.db
        .from("investigations")
        .select("*")
        .eq("learner_id", learnerId)
        .order("created_at", { ascending: false }),
      "listInvestigationsByLearner",
    );
  }

  async createInvestigation(
    row: Omit<Investigation, "id" | "created_at">,
  ): Promise<Investigation> {
    return readOne<Investigation>(
      this.db
        .from("investigations")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createInvestigation",
    );
  }

  async updateInvestigation(
    id: string,
    patch: Partial<Investigation>,
  ): Promise<Investigation> {
    return readOne<Investigation>(
      this.db
        .from("investigations")
        .update(patch)
        .eq("id", id)
        .select()
        .single(),
      "updateInvestigation",
    );
  }

  async linkAttempt(investigationId: string, attemptId: string): Promise<void> {
    await write(
      this.db.from("investigation_attempts").upsert(
        { investigation_id: investigationId, attempt_id: attemptId },
        { onConflict: "investigation_id,attempt_id" },
      ),
      "linkAttempt",
    );
  }

  async listAttemptIds(investigationId: string): Promise<string[]> {
    const rows = await readMany<{ attempt_id: string }>(
      this.db
        .from("investigation_attempts")
        .select("*")
        .eq("investigation_id", investigationId),
      "listAttemptIds",
    );
    return rows.map((r) => r.attempt_id);
  }

  async getStrategy(id: string): Promise<SupportStrategy | null> {
    return readMaybe<SupportStrategy>(
      this.db
        .from("support_strategies")
        .select("*")
        .eq("id", id)
        .maybeSingle(),
      "getStrategy",
    );
  }

  async createStrategy(
    row: Omit<SupportStrategy, "id" | "created_at">,
  ): Promise<SupportStrategy> {
    return readOne<SupportStrategy>(
      this.db
        .from("support_strategies")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createStrategy",
    );
  }

  async listStrategiesByInvestigation(
    investigationId: string,
  ): Promise<SupportStrategy[]> {
    return readMany<SupportStrategy>(
      this.db
        .from("support_strategies")
        .select("*")
        .eq("investigation_id", investigationId),
      "listStrategiesByInvestigation",
    );
  }

  async updateStrategy(
    id: string,
    patch: Partial<SupportStrategy>,
  ): Promise<SupportStrategy> {
    return readOne<SupportStrategy>(
      this.db
        .from("support_strategies")
        .update(patch)
        .eq("id", id)
        .select()
        .single(),
      "updateStrategy",
    );
  }

  async createFollowup(
    row: Omit<Followup, "id" | "created_at">,
  ): Promise<Followup> {
    return readOne<Followup>(
      this.db
        .from("followups")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createFollowup",
    );
  }

  async getFollowup(id: string): Promise<Followup | null> {
    return readMaybe<Followup>(
      this.db.from("followups").select("*").eq("id", id).maybeSingle(),
      "getFollowup",
    );
  }

  async listFollowupsByStrategy(strategyId: string): Promise<Followup[]> {
    return readMany<Followup>(
      this.db
        .from("followups")
        .select("*")
        .eq("support_strategy_id", strategyId),
      "listFollowupsByStrategy",
    );
  }

  async updateFollowup(
    id: string,
    patch: Partial<Followup>,
  ): Promise<Followup> {
    return readOne<Followup>(
      this.db.from("followups").update(patch).eq("id", id).select().single(),
      "updateFollowup",
    );
  }

  async createReport(
    row: Omit<AiReport, "id" | "created_at">,
  ): Promise<AiReport> {
    return readOne<AiReport>(
      this.db
        .from("ai_reports")
        .insert({ ...row, id: newId(), created_at: nowIso() })
        .select()
        .single(),
      "createReport",
    );
  }

  async getReport(id: string): Promise<AiReport | null> {
    return readMaybe<AiReport>(
      this.db.from("ai_reports").select("*").eq("id", id).maybeSingle(),
      "getReport",
    );
  }

  async listReportsByInvestigation(
    investigationId: string,
  ): Promise<AiReport[]> {
    return readMany<AiReport>(
      this.db
        .from("ai_reports")
        .select("*")
        .eq("investigation_id", investigationId)
        .order("created_at", { ascending: false }),
      "listReportsByInvestigation",
    );
  }

  async reviewReport(
    id: string,
    status: AiReport["review_status"],
    by: string,
  ): Promise<AiReport> {
    return readOne<AiReport>(
      this.db
        .from("ai_reports")
        .update({ review_status: status, reviewed_by: by, reviewed_at: nowIso() })
        .eq("id", id)
        .select()
        .single(),
      "reviewReport",
    );
  }

  async logRun(row: Omit<AiRun, "id" | "created_at">): Promise<void> {
    await write(
      this.db
        .from("ai_runs")
        .insert({ ...row, id: newId(), created_at: nowIso() }),
      "logRun",
    );
  }

  async listRunsByInvestigation(investigationId: string): Promise<AiRun[]> {
    return readMany<AiRun>(
      this.db
        .from("ai_runs")
        .select("*")
        .eq("investigation_id", investigationId)
        .order("created_at", { ascending: false }),
      "listRunsByInvestigation",
    );
  }

  async listResources(): Promise<Resource[]> {
    return readMany<Resource>(
      this.db.from("resources").select("*").order("title"),
      "listResources",
    );
  }

  async getResource(id: string): Promise<Resource | null> {
    return readMaybe<Resource>(
      this.db.from("resources").select("*").eq("id", id).maybeSingle(),
      "getResource",
    );
  }

  async logEvent(row: Omit<AuditEvent, "id" | "created_at">): Promise<void> {
    await write(
      this.db
        .from("audit_events")
        .insert({ ...row, id: newId(), created_at: nowIso() }),
      "logEvent",
    );
  }

  async createDevSession(userId: string): Promise<DevSession> {
    const session: DevSession = {
      token: newId() + newId().replace(/-/g, ""),
      user_id: userId,
      created_at: nowIso(),
    };
    await write(this.db.from("dev_sessions").insert(session), "createDevSession");
    return session;
  }

  async getDevSession(token: string): Promise<DevSession | null> {
    return readMaybe<DevSession>(
      this.db.from("dev_sessions").select("*").eq("token", token).maybeSingle(),
      "getDevSession",
    );
  }

  async deleteDevSession(token: string): Promise<void> {
    await write(
      this.db.from("dev_sessions").delete().eq("token", token),
      "deleteDevSession",
    );
  }

  async replaceAll(db: DbShape): Promise<void> {
    // Wipe child-first (restricting FKs: followups and update targets go
    // before the rows they point at), then insert parent-first. Empty
    // arrays are skipped: supabase-js rejects empty inserts.
    const wipe: Array<[string, string, string]> = [
      ["responses", "attempt_id", NIL_UUID],
      ["investigation_attempts", "investigation_id", NIL_UUID],
      ["followups", "support_strategy_id", NIL_UUID],
      ["ai_reports", "investigation_id", NIL_UUID],
      ["ai_runs", "investigation_id", NIL_UUID],
      ["attempts", "id", NIL_UUID],
      ["support_strategies", "id", NIL_UUID],
      ["investigations", "id", NIL_UUID],
      ["observations", "id", NIL_UUID],
      ["learner_access", "user_id", NIL_UUID],
      ["dev_sessions", "token", ""],
      ["learners", "id", NIL_UUID],
      ["profiles", "id", NIL_UUID],
      ["assessment_definitions", "id", NIL_UUID],
      ["resources", "id", NIL_UUID],
      ["audit_events", "id", NIL_UUID],
    ];
    for (const [table, column, impossible] of wipe) {
      await write(
        this.db.from(table).delete().neq(column, impossible as never),
        "replaceAll",
      );
    }
    const put = async <T>(table: string, rows: T[]): Promise<void> => {
      if (rows.length === 0) return;
      await write(this.db.from(table).insert(rows), "replaceAll");
    };
    await put("profiles", db.profiles);
    await put("assessment_definitions", db.assessment_definitions);
    await put("resources", db.resources);
    await put("learners", db.learners);
    await put("learner_access", db.learner_access);
    await put("observations", db.observations);
    await put("investigations", db.investigations);
    await put("support_strategies", db.support_strategies);
    await put("attempts", db.attempts);
    await put("investigation_attempts", db.investigation_attempts);
    await put("responses", db.responses);
    await put("ai_runs", db.ai_runs);
    await put("ai_reports", db.ai_reports);
    await put("followups", db.followups);
    await put("audit_events", db.audit_events);
    await put("dev_sessions", db.dev_sessions);
  }
}
