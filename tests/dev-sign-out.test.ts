import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const jar = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = jar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: (name: string, value: string) => {
      jar.set(name, value);
    },
    delete: (name: string) => {
      jar.delete(name);
    },
  }),
}));

import { POST } from "../app/api/dev/sign-out/route";
import { __resetRepository, getRepository } from "../lib/db";
import { DEV_SESSION_COOKIE } from "../lib/auth/dev-accounts";
import { emptyDb, nowIso } from "../lib/db/repository";

function useTempStore(): void {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "mt-signout-"));
  __resetRepository();
  jar.clear();
}

async function seedTeacherWithSession(): Promise<string> {
  const at = nowIso();
  await getRepository().replaceAll({
    ...emptyDb(),
    profiles: [
      { id: "u-a", display_name: "Teacher A (synthetic)", role: "teacher", email: "teacher.a@example.test", created_at: at },
    ],
  });
  const session = await getRepository().createDevSession("u-a");
  jar.set(DEV_SESSION_COOKIE, session.token);
  return session.token;
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("POST /api/dev/sign-out", () => {
  beforeEach(() => {
    useTempStore();
  });

  it("signs out in production when dev auth is enabled (the live case)", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEV_AUTH", "true");
    const token = await seedTeacherWithSession();

    const res = await POST();
    expect(res.status).toBe(200);
    expect(await getRepository().getDevSession(token)).toBeNull();
    expect(jar.get(DEV_SESSION_COOKIE)).toBeUndefined();
  });

  it("is not found in production when dev auth is disabled", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOW_DEV_AUTH", "");
    const token = await seedTeacherWithSession();

    const res = await POST();
    expect(res.status).toBe(404);
    expect(await getRepository().getDevSession(token)).not.toBeNull();
  });
});
