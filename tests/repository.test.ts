import { describe, expect, it, beforeEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { LocalJsonRepository, emptyDb, newId, nowIso } from "../lib/db/repository";
import { requireLearnerAccess } from "../lib/auth/access";
import { assertDevAuthAllowed } from "../lib/auth/dev";

function freshRepo(): LocalJsonRepository {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "mt-test-"));
  return new LocalJsonRepository();
}

describe("local repository", () => {
  let repo: LocalJsonRepository;
  beforeEach(() => {
    repo = freshRepo();
  });

  it("isolates learners by access grant", async () => {
    await repo.replaceAll({
      ...emptyDb(),
      profiles: [
        { id: "u-a", display_name: "A", role: "teacher", email: "a@example.test", created_at: nowIso() },
        { id: "u-b", display_name: "B", role: "teacher", email: "b@example.test", created_at: nowIso() },
      ],
      learners: [
        { id: "l-1", code: "L-0001", pseudonym: null, stage: "Year 2", preferred_language: "en", assessment_language: "en", accessibility_prefs: {}, created_by: "u-a", created_at: nowIso() },
      ],
      learner_access: [
        { user_id: "u-a", learner_id: "l-1", access_role: "owner", granted_at: nowIso(), revoked_at: null },
      ],
    });
    expect(await repo.listLearnersForUser("u-a")).toHaveLength(1);
    expect(await repo.listLearnersForUser("u-b")).toHaveLength(0);
  });

  it("denies access without a grant and for viewers on write", async () => {
    await repo.replaceAll({
      ...emptyDb(),
      learner_access: [
        { user_id: "u-b", learner_id: "l-1", access_role: "viewer", granted_at: nowIso(), revoked_at: null },
      ],
    });
    await expect(requireLearnerAccess("nobody", "l-1")).rejects.toThrow(/denied/i);
    await requireLearnerAccess("u-b", "l-1");
    await expect(requireLearnerAccess("u-b", "l-1", true)).rejects.toThrow(/denied/i);
  });

  it("revoked grants stop access immediately", async () => {
    await repo.replaceAll({
      ...emptyDb(),
      learner_access: [
        { user_id: "u-a", learner_id: "l-1", access_role: "owner", granted_at: nowIso(), revoked_at: nowIso() },
      ],
    });
    await expect(requireLearnerAccess("u-a", "l-1")).rejects.toThrow(/denied/i);
  });

  it("deletes a learner with cascade and audit event", async () => {
    const at = nowIso();
    await repo.replaceAll({
      ...emptyDb(),
      learners: [
        { id: "l-1", code: "L-0001", pseudonym: null, stage: null, preferred_language: "en", assessment_language: "en", accessibility_prefs: {}, created_by: "u-a", created_at: at },
      ],
      learner_access: [
        { user_id: "u-a", learner_id: "l-1", access_role: "owner", granted_at: at, revoked_at: null },
      ],
      observations: [
        { id: newId(), learner_id: "l-1", author_id: "u-a", observed_on: "2026-10-28", category: "reading", context: null, behaviour: "x", frequency: null, source: "observed", created_at: at },
      ],
    });
    await repo.deleteLearner("l-1", "u-a");
    expect(await repo.getLearner("l-1")).toBeNull();
    expect(await repo.listObservations("l-1")).toHaveLength(0);
    expect(await requireLearnerAccess("u-a", "l-1").then(() => "open", () => "denied")).toBe("denied");
  });
});

describe("dev auth production refusal", () => {
  it("refuses development sign-in in production", async () => {
    const writableEnv = process.env as Record<string, string | undefined>;
    const prior = writableEnv.NODE_ENV;
    writableEnv.NODE_ENV = "production";
    try {
      expect(() => assertDevAuthAllowed()).toThrow(/production/i);
    } finally {
      writableEnv.NODE_ENV = prior;
    }
  });
});
