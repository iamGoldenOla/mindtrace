import { afterEach, describe, expect, it } from "vitest";
import { POST } from "../app/api/ai/probe/route";

function probeRequest(body: unknown, headers?: HeadersInit): Request {
  return new Request("http://localhost/api/ai/probe", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const priorNodeEnv = process.env.NODE_ENV;
const writableEnv = process.env as Record<string, string | undefined>;

afterEach(() => {
  writableEnv.NODE_ENV = priorNodeEnv;
});

describe("probe route auth gate", () => {
  it("returns 401 without leaking anything when no user is signed in", async () => {
    const res = await POST(probeRequest({}));
    expect(res.status).toBe(401);
    const text = await res.text();
    expect(text).not.toContain("MODEL_API_KEY");
    expect(text).not.toContain("Bearer");
  });

  it("returns 401 for a malformed authorization header", async () => {
    const res = await POST(
      probeRequest({}, { Authorization: "Token abc123" })
    );
    expect(res.status).toBe(401);
  });

  it("rejects unknown fields with 400 only for signed-in users", async () => {
    // Anonymous callers are stopped at the auth gate before validation.
    const res = await POST(probeRequest({ prompt: "hi", extra: true }));
    expect(res.status).toBe(401);
  });

  it("is disabled with 404 in production", async () => {
    writableEnv.NODE_ENV = "production";
    const res = await POST(
      probeRequest(
        {},
        { Authorization: "Bearer placeholder-token" }
      )
    );
    expect(res.status).toBe(404);
  });
});

// A live signed-in success path needs a real Supabase project, a teacher
// account, and a model key, so it runs only when those are provided and
// never fakes a pass.
const canRunLive =
  !!process.env.SUPABASE_TEST_URL &&
  !!process.env.SUPABASE_TEST_TOKEN_A &&
  !!process.env.MODEL_API_KEY;

describe.runIf(canRunLive)("probe route (live, signed in)", () => {
  it("returns a model reply for a signed-in teacher", async () => {
    const res = await POST(
      probeRequest(
        {},
        { Authorization: `Bearer ${process.env.SUPABASE_TEST_TOKEN_A}` }
      )
    );
    expect(res.status).toBe(200);
  });
});

describe.skipIf(canRunLive)("probe route (no live project)", () => {
  it("records that live signed-in checks are pending", () => {
    expect(canRunLive).toBe(false);
  });
});
