import { describe, expect, it, beforeEach, vi } from "vitest";
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

import { GET, POST } from "../app/api/dev/seed/route";
import { __resetRepository } from "../lib/db";

function useTempStore(): void {
  process.env.DATA_DIR = mkdtempSync(path.join(tmpdir(), "mt-seed-"));
  __resetRepository();
  jar.clear();
}

describe("dev seed status and bootstrap", () => {
  beforeEach(() => {
    useTempStore();
  });

  it("reports unseeded on an empty store", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      ok: true,
      backend: "local",
      seeded: false,
      teachers: [],
      learners: 0,
    });
  });

  it("bootstrap seed fills the store and reports seeded", async () => {
    const seeded = await POST();
    expect(seeded.status).toBe(200);
    expect(await seeded.json()).toMatchObject({
      ok: true,
      counts: { teachers: 2, learners: 4 },
    });

    const res = await GET();
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      ok: boolean;
      seeded: boolean;
      learners: number;
      teachers: string[];
    };
    expect(body).toMatchObject({ ok: true, seeded: true, learners: 3 });
    expect(body.teachers).toHaveLength(2);
  });

  it("refuses a second unauthenticated seed once teachers exist", async () => {
    const first = await POST();
    expect(first.status).toBe(200);
    const second = await POST();
    expect(second.status).toBe(401);
  });
});
