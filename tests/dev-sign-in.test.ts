import { describe, expect, it, beforeEach, vi } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

// In-memory cookie jar for the next/headers mock.
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

import { POST } from "../app/api/dev/sign-in/route";
import { __resetRepository, getRepository } from "../lib/db";
import { emptyDb, nowIso } from "../lib/db/repository";

function useTempStore(): void {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "mt-signin-"));
  __resetRepository();
  jar.clear();
}

async function seedTeachers(): Promise<void> {
  const at = nowIso();
  await getRepository().replaceAll({
    ...emptyDb(),
    profiles: [
      { id: "u-a", display_name: "Teacher A (synthetic)", role: "teacher", email: "teacher.a@example.test", created_at: at },
    ],
  });
}

function request(email: unknown): Request {
  return new Request("http://localhost/api/dev/sign-in", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

describe("POST /api/dev/sign-in", () => {
  beforeEach(() => {
    useTempStore();
  });

  it("signs in a seeded development teacher", async () => {
    await seedTeachers();
    const res = await POST(request("teacher.a@example.test"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
  });

  it("returns 401 for an unknown development account", async () => {
    await seedTeachers();
    const res = await POST(request("nobody@example.test"));
    expect(res.status).toBe(401);
  });

  it("returns 500 (not 401) when the store cannot be read", async () => {
    // Corrupt db.json so the repository load throws: this is a server
    // problem, not an unknown account, and must not be reported as 401.
    writeFileSync(path.join(process.env.DATA_DIR as string, "db.json"), "{not json");
    const res = await POST(request("teacher.a@example.test"));
    expect(res.status).toBe(500);
  });
});
