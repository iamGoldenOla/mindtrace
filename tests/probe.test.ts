import { describe, expect, it } from "vitest";
import { POST } from "../app/api/ai/probe/route";

function probeRequest(body: unknown): Request {
  return new Request("http://localhost/api/ai/probe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("probe route fail-safe (no key)", () => {
  it("returns 503 without leaking anything when no key is set", async () => {
    delete process.env.MODEL_API_KEY;
    const res = await POST(probeRequest({}));
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).not.toContain("MODEL_API_KEY");
    expect(text).not.toContain("Bearer");
  });

  it("rejects unknown fields with 400", async () => {
    const res = await POST(probeRequest({ prompt: "hi", extra: true }));
    expect(res.status).toBe(400);
  });
});
