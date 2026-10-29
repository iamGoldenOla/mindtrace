// Repository interface + local JSON file store.
// All data access goes through `Repository` so a Supabase implementation can
// replace LocalJsonRepository later without touching pages or routes.
// Table/column shapes mirror DATABASE.md (snake_case). DEV/LOCAL ONLY.

import { promises as fs } from "node:fs";
import path from "node:path";

export interface Profile {
  id: string;
  display_name: string | null;
  role: "teacher" | "parent" | "specialist" | "admin";
  email: string;
  created_at: string;
}

export interface Learner {
  id: string;
  code: string;
  pseudonym: string | null;
  stage: string | null;
  preferred_language: string;
  assessment_language: string;
  accessibility_prefs: Record<string, unknown>;
  created_by: string;
  created_at: string;
}

export interface LearnerAccess {
  user_id: string;
  learner_id: string;
  access_role: "owner" | "contributor" | "viewer";
  granted_at: string;
  revoked_at: string | null;
}

export interface Observation {
  id: string;
  learner_id: string;
  author_id: string;
  observed_on: string;
  category: string | null;
  context: string | null;
  behaviour: string;
  frequency: string | null;
  source: "teacher_report" | "parent_report" | "observed" | "assessment";
  created_at: string;
}

export interface AssessmentDefinition {
  id: string;
  slug: string;
  name: string;
  skill: string;
  form: string | null;
  language: string;
  level: string | null;
  instructions: Record<string, unknown>;
  scoring: Record<string, unknown>;
  target: { words: string[]; sentences: string[] };
  validation_status: string;
  version: number;
}

export interface SupportStrategy {
  id: string;
  investigation_id: string;
  catalog_key: string;
  description: string;
  target: string | null;
  rationale: string | null;
  start_date: string;
  status: "active" | "paused" | "ended";
  created_by: string;
  created_at: string;
}

export interface Attempt {
  id: string;
  learner_id: string;
  definition_id: string;
  language: string;
  condition: "baseline" | "support" | "followup";
  support_strategy_id: string | null;
  status: "in_progress" | "completed" | "abandoned";
  asr_status: string | null;
  transcript: string | null;
  transcript_corrected: string | null;
  evidence_version: string | null;
  started_at: string;
  completed_at: string | null;
  created_by: string;
}

export interface ResponseRow {
  id: string;
  attempt_id: string;
  evidence_id: string;
  item_ref: string;
  target: string | null;
  observed: string | null;
  outcome: string;
  error_category: string | null;
  hints_used: number;
  support_used: string[];
  response_ms: number | null;
}

export interface Investigation {
  id: string;
  learner_id: string;
  concern: string;
  status: "open" | "report_ready" | "support_active" | "closed";
  created_by: string;
  created_at: string;
}

export interface AiRun {
  id: string;
  investigation_id: string | null;
  kind: "investigate" | "verify" | "image" | "asr" | "followup";
  provider: string;
  model: string;
  prompt_version: string | null;
  schema_version: string | null;
  input_hash: string | null;
  status: "ok" | "failed" | "rejected";
  error: string | null;
  latency_ms: number | null;
  tokens_in: number | null;
  tokens_out: number | null;
  created_at: string;
}

export interface AiReport {
  id: string;
  investigation_id: string;
  ai_run_id: string | null;
  report: Record<string, unknown>;
  verification: Record<string, unknown>;
  review_status: "pending_teacher_review" | "approved" | "edited" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Followup {
  id: string;
  support_strategy_id: string;
  baseline_attempt_id: string;
  followup_attempt_id: string | null;
  comparison: Record<string, unknown> | null;
  teacher_notes: string | null;
  decision: "continue" | "change" | "review" | "refer" | null;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  publisher: string;
  url: string;
  type: "video" | "guide" | "article" | "training" | "tool";
  language: string;
  topics: string[];
  audience: string[];
  summary: string;
  practical_action: string;
  review_status: "unreviewed" | "reviewed" | "rejected";
  reviewed_on: string | null;
  region: string[];
}

export interface AuditEvent {
  id: string;
  actor_id: string | null;
  action: string;
  record_type: string;
  record_id: string | null;
  created_at: string;
}

export interface DevSession {
  token: string;
  user_id: string;
  created_at: string;
}

export interface DbShape {
  profiles: Profile[];
  learners: Learner[];
  learner_access: LearnerAccess[];
  observations: Observation[];
  assessment_definitions: AssessmentDefinition[];
  support_strategies: SupportStrategy[];
  attempts: Attempt[];
  responses: ResponseRow[];
  investigations: Investigation[];
  investigation_attempts: { investigation_id: string; attempt_id: string }[];
  ai_runs: AiRun[];
  ai_reports: AiReport[];
  followups: Followup[];
  resources: Resource[];
  audit_events: AuditEvent[];
  dev_sessions: DevSession[];
}

export function emptyDb(): DbShape {
  return {
    profiles: [],
    learners: [],
    learner_access: [],
    observations: [],
    assessment_definitions: [],
    support_strategies: [],
    attempts: [],
    responses: [],
    investigations: [],
    investigation_attempts: [],
    ai_runs: [],
    ai_reports: [],
    followups: [],
    resources: [],
    audit_events: [],
    dev_sessions: [],
  };
}

export function newId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export interface Repository {
  getUserByEmail(email: string): Promise<Profile | null>;
  getUserById(id: string): Promise<Profile | null>;
  listLearnersForUser(userId: string): Promise<Learner[]>;
  getLearner(id: string): Promise<Learner | null>;
  createLearner(row: Omit<Learner, "id" | "created_at">): Promise<Learner>;
  deleteLearner(id: string, actorId: string): Promise<void>;
  getAccess(userId: string, learnerId: string): Promise<LearnerAccess | null>;
  grantAccess(row: Omit<LearnerAccess, "granted_at">): Promise<void>;
  listObservations(learnerId: string): Promise<Observation[]>;
  createObservation(row: Omit<Observation, "id" | "created_at">): Promise<Observation>;
  listDefinitions(): Promise<AssessmentDefinition[]>;
  getDefinitionBySlug(slug: string): Promise<AssessmentDefinition | null>;
  getDefinition(id: string): Promise<AssessmentDefinition | null>;
  getAttempt(id: string): Promise<Attempt | null>;
  listAttemptsByLearner(learnerId: string): Promise<Attempt[]>;
  createAttempt(row: Omit<Attempt, "id" | "started_at">): Promise<Attempt>;
  updateAttempt(id: string, patch: Partial<Attempt>): Promise<Attempt>;
  listResponses(attemptId: string): Promise<ResponseRow[]>;
  replaceResponses(attemptId: string, rows: Omit<ResponseRow, "id" | "attempt_id">[]): Promise<ResponseRow[]>;
  getInvestigation(id: string): Promise<Investigation | null>;
  listInvestigationsByLearner(learnerId: string): Promise<Investigation[]>;
  createInvestigation(row: Omit<Investigation, "id" | "created_at">): Promise<Investigation>;
  updateInvestigation(id: string, patch: Partial<Investigation>): Promise<Investigation>;
  linkAttempt(investigationId: string, attemptId: string): Promise<void>;
  listAttemptIds(investigationId: string): Promise<string[]>;
  getStrategy(id: string): Promise<SupportStrategy | null>;
  createStrategy(row: Omit<SupportStrategy, "id" | "created_at">): Promise<SupportStrategy>;
  listStrategiesByInvestigation(investigationId: string): Promise<SupportStrategy[]>;
  updateStrategy(id: string, patch: Partial<SupportStrategy>): Promise<SupportStrategy>;
  createFollowup(row: Omit<Followup, "id" | "created_at">): Promise<Followup>;
  getFollowup(id: string): Promise<Followup | null>;
  listFollowupsByStrategy(strategyId: string): Promise<Followup[]>;
  updateFollowup(id: string, patch: Partial<Followup>): Promise<Followup>;
  createReport(row: Omit<AiReport, "id" | "created_at">): Promise<AiReport>;
  getReport(id: string): Promise<AiReport | null>;
  listReportsByInvestigation(investigationId: string): Promise<AiReport[]>;
  reviewReport(id: string, status: AiReport["review_status"], by: string): Promise<AiReport>;
  logRun(row: Omit<AiRun, "id" | "created_at">): Promise<void>;
  listRunsByInvestigation(investigationId: string): Promise<AiRun[]>;
  listResources(): Promise<Resource[]>;
  getResource(id: string): Promise<Resource | null>;
  logEvent(row: Omit<AuditEvent, "id" | "created_at">): Promise<void>;
  createDevSession(userId: string): Promise<DevSession>;
  getDevSession(token: string): Promise<DevSession | null>;
  deleteDevSession(token: string): Promise<void>;
  replaceAll(db: DbShape): Promise<void>;
}

function dataFile(): string {
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  return path.join(dir, "db.json");
}

export class LocalJsonRepository implements Repository {
  private cache: DbShape | null = null;

  private async load(): Promise<DbShape> {
    if (this.cache) return this.cache;
    try {
      const raw = await fs.readFile(dataFile(), "utf8");
      this.cache = { ...emptyDb(), ...(JSON.parse(raw) as Partial<DbShape>) };
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === "ENOENT") {
        this.cache = emptyDb();
      } else {
        throw err;
      }
    }
    return this.cache as DbShape;
  }

  private async save(db: DbShape): Promise<void> {
    const file = dataFile();
    await fs.mkdir(path.dirname(file), { recursive: true });
    const tmp = `${file}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(db, null, 2), "utf8");
    await fs.rename(tmp, file);
    this.cache = db;
  }

  async getUserByEmail(email: string): Promise<Profile | null> {
    const db = await this.load();
    return db.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async getUserById(id: string): Promise<Profile | null> {
    const db = await this.load();
    return db.profiles.find((p) => p.id === id) ?? null;
  }

  async listLearnersForUser(userId: string): Promise<Learner[]> {
    const db = await this.load();
    const ids = new Set(
      db.learner_access
        .filter((a) => a.user_id === userId && !a.revoked_at)
        .map((a) => a.learner_id)
    );
    return db.learners.filter((l) => ids.has(l.id));
  }

  async getLearner(id: string): Promise<Learner | null> {
    const db = await this.load();
    return db.learners.find((l) => l.id === id) ?? null;
  }

  async createLearner(row: Omit<Learner, "id" | "created_at">): Promise<Learner> {
    const db = await this.load();
    const learner: Learner = { ...row, id: newId(), created_at: nowIso() };
    db.learners.push(learner);
    await this.save(db);
    return learner;
  }

  async deleteLearner(id: string, actorId: string): Promise<void> {
    const db = await this.load();
    const attemptIds = new Set(db.attempts.filter((t) => t.learner_id === id).map((t) => t.id));
    const invIds = new Set(db.investigations.filter((i) => i.learner_id === id).map((i) => i.id));
    const strategyIds = new Set(
      db.support_strategies.filter((s) => invIds.has(s.investigation_id)).map((s) => s.id)
    );
    db.learners = db.learners.filter((l) => l.id !== id);
    db.learner_access = db.learner_access.filter((a) => a.learner_id !== id);
    db.observations = db.observations.filter((o) => o.learner_id !== id);
    db.attempts = db.attempts.filter((t) => t.learner_id !== id);
    db.responses = db.responses.filter((r) => !attemptIds.has(r.attempt_id));
    db.investigations = db.investigations.filter((i) => i.learner_id !== id);
    db.investigation_attempts = db.investigation_attempts.filter((x) => !invIds.has(x.investigation_id));
    db.support_strategies = db.support_strategies.filter((s) => !invIds.has(s.investigation_id));
    db.followups = db.followups.filter((f) => !strategyIds.has(f.support_strategy_id));
    db.ai_reports = db.ai_reports.filter((r) => !invIds.has(r.investigation_id));
    db.ai_runs = db.ai_runs.filter((r) => !r.investigation_id || !invIds.has(r.investigation_id));
    db.audit_events.push({
      id: newId(),
      actor_id: actorId,
      action: "learner.delete",
      record_type: "learner",
      record_id: id,
      created_at: nowIso(),
    });
    await this.save(db);
  }

  async getAccess(userId: string, learnerId: string): Promise<LearnerAccess | null> {
    const db = await this.load();
    const hit = db.learner_access.find((a) => a.user_id === userId && a.learner_id === learnerId);
    return hit && !hit.revoked_at ? hit : null;
  }

  async grantAccess(row: Omit<LearnerAccess, "granted_at">): Promise<void> {
    const db = await this.load();
    db.learner_access = db.learner_access.filter(
      (a) => !(a.user_id === row.user_id && a.learner_id === row.learner_id)
    );
    db.learner_access.push({ ...row, granted_at: nowIso() });
    await this.save(db);
  }

  async listObservations(learnerId: string): Promise<Observation[]> {
    const db = await this.load();
    return db.observations
      .filter((o) => o.learner_id === learnerId)
      .sort((a, b) => (a.observed_on < b.observed_on ? 1 : -1));
  }

  async createObservation(row: Omit<Observation, "id" | "created_at">): Promise<Observation> {
    const db = await this.load();
    const obs: Observation = { ...row, id: newId(), created_at: nowIso() };
    db.observations.push(obs);
    await this.save(db);
    return obs;
  }

  async listDefinitions(): Promise<AssessmentDefinition[]> {
    const db = await this.load();
    return [...db.assessment_definitions].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  async getDefinitionBySlug(slug: string): Promise<AssessmentDefinition | null> {
    const db = await this.load();
    return db.assessment_definitions.find((d) => d.slug === slug) ?? null;
  }

  async getDefinition(id: string): Promise<AssessmentDefinition | null> {
    const db = await this.load();
    return db.assessment_definitions.find((d) => d.id === id) ?? null;
  }

  async getAttempt(id: string): Promise<Attempt | null> {
    const db = await this.load();
    return db.attempts.find((t) => t.id === id) ?? null;
  }

  async listAttemptsByLearner(learnerId: string): Promise<Attempt[]> {
    const db = await this.load();
    return db.attempts
      .filter((t) => t.learner_id === learnerId)
      .sort((a, b) => (a.started_at < b.started_at ? 1 : -1));
  }

  async createAttempt(row: Omit<Attempt, "id" | "started_at">): Promise<Attempt> {
    const db = await this.load();
    const attempt: Attempt = { ...row, id: newId(), started_at: nowIso() };
    db.attempts.push(attempt);
    await this.save(db);
    return attempt;
  }

  async updateAttempt(id: string, patch: Partial<Attempt>): Promise<Attempt> {
    const db = await this.load();
    const attempt = db.attempts.find((t) => t.id === id);
    if (!attempt) throw new Error("Attempt not found.");
    Object.assign(attempt, patch);
    await this.save(db);
    return attempt;
  }

  async listResponses(attemptId: string): Promise<ResponseRow[]> {
    const db = await this.load();
    return db.responses.filter((r) => r.attempt_id === attemptId);
  }

  async replaceResponses(
    attemptId: string,
    rows: Omit<ResponseRow, "id" | "attempt_id">[]
  ): Promise<ResponseRow[]> {
    const db = await this.load();
    db.responses = db.responses.filter((r) => r.attempt_id !== attemptId);
    const saved: ResponseRow[] = rows.map((r) => ({ ...r, id: newId(), attempt_id: attemptId }));
    db.responses.push(...saved);
    await this.save(db);
    return saved;
  }

  async getInvestigation(id: string): Promise<Investigation | null> {
    const db = await this.load();
    return db.investigations.find((i) => i.id === id) ?? null;
  }

  async listInvestigationsByLearner(learnerId: string): Promise<Investigation[]> {
    const db = await this.load();
    return db.investigations
      .filter((i) => i.learner_id === learnerId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  async createInvestigation(row: Omit<Investigation, "id" | "created_at">): Promise<Investigation> {
    const db = await this.load();
    const inv: Investigation = { ...row, id: newId(), created_at: nowIso() };
    db.investigations.push(inv);
    await this.save(db);
    return inv;
  }

  async updateInvestigation(id: string, patch: Partial<Investigation>): Promise<Investigation> {
    const db = await this.load();
    const inv = db.investigations.find((i) => i.id === id);
    if (!inv) throw new Error("Investigation not found.");
    Object.assign(inv, patch);
    await this.save(db);
    return inv;
  }

  async linkAttempt(investigationId: string, attemptId: string): Promise<void> {
    const db = await this.load();
    if (!db.investigation_attempts.some((x) => x.investigation_id === investigationId && x.attempt_id === attemptId)) {
      db.investigation_attempts.push({ investigation_id: investigationId, attempt_id: attemptId });
      await this.save(db);
    }
  }

  async listAttemptIds(investigationId: string): Promise<string[]> {
    const db = await this.load();
    return db.investigation_attempts.filter((x) => x.investigation_id === investigationId).map((x) => x.attempt_id);
  }

  async getStrategy(id: string): Promise<SupportStrategy | null> {
    const db = await this.load();
    return db.support_strategies.find((s) => s.id === id) ?? null;
  }

  async createStrategy(row: Omit<SupportStrategy, "id" | "created_at">): Promise<SupportStrategy> {
    const db = await this.load();
    const s: SupportStrategy = { ...row, id: newId(), created_at: nowIso() };
    db.support_strategies.push(s);
    await this.save(db);
    return s;
  }

  async listStrategiesByInvestigation(investigationId: string): Promise<SupportStrategy[]> {
    const db = await this.load();
    return db.support_strategies.filter((s) => s.investigation_id === investigationId);
  }

  async updateStrategy(id: string, patch: Partial<SupportStrategy>): Promise<SupportStrategy> {
    const db = await this.load();
    const s = db.support_strategies.find((x) => x.id === id);
    if (!s) throw new Error("Support strategy not found.");
    Object.assign(s, patch);
    await this.save(db);
    return s;
  }

  async createFollowup(row: Omit<Followup, "id" | "created_at">): Promise<Followup> {
    const db = await this.load();
    const f: Followup = { ...row, id: newId(), created_at: nowIso() };
    db.followups.push(f);
    await this.save(db);
    return f;
  }

  async getFollowup(id: string): Promise<Followup | null> {
    const db = await this.load();
    return db.followups.find((f) => f.id === id) ?? null;
  }

  async listFollowupsByStrategy(strategyId: string): Promise<Followup[]> {
    const db = await this.load();
    return db.followups.filter((f) => f.support_strategy_id === strategyId);
  }

  async updateFollowup(id: string, patch: Partial<Followup>): Promise<Followup> {
    const db = await this.load();
    const f = db.followups.find((x) => x.id === id);
    if (!f) throw new Error("Follow-up not found.");
    Object.assign(f, patch);
    await this.save(db);
    return f;
  }

  async createReport(row: Omit<AiReport, "id" | "created_at">): Promise<AiReport> {
    const db = await this.load();
    const r: AiReport = { ...row, id: newId(), created_at: nowIso() };
    db.ai_reports.push(r);
    await this.save(db);
    return r;
  }

  async getReport(id: string): Promise<AiReport | null> {
    const db = await this.load();
    return db.ai_reports.find((r) => r.id === id) ?? null;
  }

  async listReportsByInvestigation(investigationId: string): Promise<AiReport[]> {
    const db = await this.load();
    return db.ai_reports
      .filter((r) => r.investigation_id === investigationId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  async reviewReport(id: string, status: AiReport["review_status"], by: string): Promise<AiReport> {
    const db = await this.load();
    const r = db.ai_reports.find((x) => x.id === id);
    if (!r) throw new Error("Report not found.");
    r.review_status = status;
    r.reviewed_by = by;
    r.reviewed_at = nowIso();
    await this.save(db);
    return r;
  }

  async logRun(row: Omit<AiRun, "id" | "created_at">): Promise<void> {
    const db = await this.load();
    db.ai_runs.push({ ...row, id: newId(), created_at: nowIso() });
    await this.save(db);
  }

  async listRunsByInvestigation(investigationId: string): Promise<AiRun[]> {
    const db = await this.load();
    return db.ai_runs
      .filter((r) => r.investigation_id === investigationId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  async listResources(): Promise<Resource[]> {
    const db = await this.load();
    return [...db.resources].sort((a, b) => a.title.localeCompare(b.title));
  }

  async getResource(id: string): Promise<Resource | null> {
    const db = await this.load();
    return db.resources.find((r) => r.id === id) ?? null;
  }

  async logEvent(row: Omit<AuditEvent, "id" | "created_at">): Promise<void> {
    const db = await this.load();
    db.audit_events.push({ ...row, id: newId(), created_at: nowIso() });
    await this.save(db);
  }

  async createDevSession(userId: string): Promise<DevSession> {
    const db = await this.load();
    const s: DevSession = { token: newId() + newId().replace(/-/g, ""), user_id: userId, created_at: nowIso() };
    db.dev_sessions.push(s);
    await this.save(db);
    return s;
  }

  async getDevSession(token: string): Promise<DevSession | null> {
    const db = await this.load();
    return db.dev_sessions.find((s) => s.token === token) ?? null;
  }

  async deleteDevSession(token: string): Promise<void> {
    const db = await this.load();
    db.dev_sessions = db.dev_sessions.filter((s) => s.token !== token);
    await this.save(db);
  }

  async replaceAll(db: DbShape): Promise<void> {
    await this.save({ ...emptyDb(), ...db });
  }
}
