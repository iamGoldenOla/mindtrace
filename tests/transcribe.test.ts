import { describe, expect, it } from "vitest";
import { parseTranscriptPayload } from "../lib/ai/transcribe";

describe("transcript payload parser", () => {
  it("reads text and word timing when present", async () => {
    const parsed = parseTranscriptPayload({
      text: "Sam has a red hat",
      words: [{ text: "Sam", start: 0, end: 0.4, confidence: 0.9 }],
    });
    expect(parsed.text).toBe("Sam has a red hat");
    expect(parsed.words).toHaveLength(1);
    expect(parsed.words?.[0].confidence).toBe(0.9);
  });

  it("falls back to nested transcript fields without timing", async () => {
    const parsed = parseTranscriptPayload({ data: { transcript: "hello world" } });
    expect(parsed.text).toBe("hello world");
    expect(parsed.words).toBeUndefined();
  });

  it("returns empty text for unusable payloads", async () => {
    expect(parseTranscriptPayload(null).text).toBe("");
    expect(parseTranscriptPayload({}).text).toBe("");
  });
});
