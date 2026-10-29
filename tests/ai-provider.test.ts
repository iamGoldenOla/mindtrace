import { describe, expect, it } from "vitest";
import { assertAllowedModel } from "../lib/ai/provider";

describe("model allowlist", () => {
  it("allows the three pinned Meta models", () => {
    expect(() =>
      assertAllowedModel("muse-spark-1.3")
    ).not.toThrow();
    expect(() =>
      assertAllowedModel("muse-voice-transcribe-1.0")
    ).not.toThrow();
    expect(() => assertAllowedModel("muse-image-1.0")).not.toThrow();
  });

  it("rejects -contributor variants with learner data", () => {
    expect(() =>
      assertAllowedModel("muse-spark-1.3-contributor")
    ).toThrow(/contributor/);
  });

  it("rejects unknown models", () => {
    expect(() => assertAllowedModel("other-model")).toThrow(/allowlist/);
  });
});
