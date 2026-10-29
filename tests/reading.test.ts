import { describe, expect, it } from "vitest";
import { align, categorize } from "../lib/reading/align";
import { summarize } from "../lib/reading/evidence";
import { compare } from "../lib/reading/compare";

const FORM_A = [
  "Sam", "has", "a", "red", "hat", "The", "hat", "is", "on", "the", "bed",
  "A", "dog", "sits", "on", "the", "mat", "by", "the", "shed", "Then",
  "the", "dog", "digs", "in", "the", "sand", "and", "finds", "a", "shell",
];

function summarizeText(transcript: string, short = "t01") {
  const a = align(FORM_A, transcript, short);
  return summarize(a.records, {
    hesitations: a.hesitations,
    repetitions: a.repetitions,
    transcriptEmpty: transcript.trim().length === 0,
    asrFailed: false,
  });
}

describe("alignment", () => {
  it("exact match yields all matches", () => {
    const passage = FORM_A.join(" ");
    const a = align(FORM_A, passage, "t01");
    expect(a.records.filter((r) => r.outcome === "match")).toHaveLength(31);
  });

  it("one substitution is recorded with a category", () => {
    const words = [...FORM_A];
    words[4] = "hit";
    const a = align(FORM_A, words.join(" "), "t01");
    const rec = a.records.find((r) => r.index === 4);
    expect(rec?.outcome).toBe("substitution");
    expect(rec?.category).toBe("vowel_substitution");
  });

  it("omission is recorded", () => {
    const words = FORM_A.filter((_, idx) => idx !== 4);
    const a = align(FORM_A, words.join(" "), "t01");
    expect(a.records.find((r) => r.index === 4)?.outcome).toBe("omission");
  });

  it("insertion is recorded", () => {
    const words = [...FORM_A.slice(0, 5), "very", ...FORM_A.slice(5)];
    const a = align(FORM_A, words.join(" "), "t01");
    expect(a.records.some((r) => r.outcome === "insertion")).toBe(true);
  });

  it("immediate repetitions collapse and count", () => {
    const words = [...FORM_A];
    words.splice(4, 0, "hat");
    const a = align(FORM_A, words.join(" "), "t01");
    expect(a.repetitions).toBe(1);
    expect(a.records.filter((r) => r.outcome === "match")).toHaveLength(31);
  });

  it("filler tokens are hesitations, not errors", () => {
    const a = align(FORM_A, `um ${FORM_A.join(" ")} uh`, "t01");
    expect(a.hesitations).toBe(2);
    expect(a.records.filter((r) => r.outcome === "match")).toHaveLength(31);
  });

  it("empty transcript yields omissions and insufficient evidence", () => {
    const a = align(FORM_A, "   ", "t01");
    const m = summarize(a.records, {
      hesitations: 0,
      repetitions: 0,
      transcriptEmpty: true,
      asrFailed: false,
    });
    expect(m.omissions).toBe(31);
    expect(m.evidenceQuality).toBe("insufficient");
  });

  it("longer transcript yields insertions", () => {
    const a = align(FORM_A, `${FORM_A.join(" ")} extra words here`, "t01");
    expect(a.records.filter((r) => r.outcome === "insertion").length).toBeGreaterThan(0);
  });

  it("counts sum to the target length (property)", () => {
    const samples = [
      FORM_A.join(" "),
      "Sam has a red hit",
      "hello world",
      "",
      `${FORM_A.join(" ")} ${FORM_A.join(" ")}`,
    ];
    for (const s of samples) {
      const a = align(FORM_A, s, "t01");
      const target = a.records.filter((r) => r.index >= 0);
      const n =
        target.filter((r) => r.outcome === "match").length +
        target.filter((r) => r.outcome === "substitution").length +
        target.filter((r) => r.outcome === "omission").length;
      expect(n).toBe(31);
    }
  });
});

describe("categories", () => {
  it("visual_reversal: was/saw, on/no; not hat/hit", () => {
    expect(categorize("was", "saw")).toBe("visual_reversal");
    expect(categorize("on", "no")).toBe("visual_reversal");
    expect(categorize("hat", "hit")).not.toBe("visual_reversal");
  });

  it("vowel_substitution: hat/hit, bed/bad; not hat/had", () => {
    expect(categorize("hat", "hit")).toBe("vowel_substitution");
    expect(categorize("bed", "bad")).toBe("vowel_substitution");
    expect(categorize("hat", "had")).not.toBe("vowel_substitution");
  });

  it("consonant_substitution: hat/had, mat/map; not hat/hit", () => {
    expect(categorize("hat", "had")).toBe("consonant_substitution");
    expect(categorize("mat", "map")).toBe("consonant_substitution");
    expect(categorize("hat", "hit")).not.toBe("consonant_substitution");
  });

  it("ending_omission: digs/dig, finds/find; not hat/hit", () => {
    expect(categorize("digs", "dig")).toBe("ending_omission");
    expect(categorize("finds", "find")).toBe("ending_omission");
    expect(categorize("hat", "hit")).not.toBe("ending_omission");
  });

  it("onset_match_only: shed/sat, bench/bat; not hat/had", () => {
    expect(categorize("shed", "sat")).toBe("onset_match_only");
    expect(categorize("bench", "bat")).toBe("onset_match_only");
    expect(categorize("hat", "had")).not.toBe("onset_match_only");
  });

  it("unrelated_word: hat/elephant, dog/aeroplane; not hat/had", () => {
    expect(categorize("hat", "elephant")).toBe("unrelated_word");
    expect(categorize("dog", "aeroplane")).toBe("unrelated_word");
    expect(categorize("hat", "had")).not.toBe("unrelated_word");
  });

  it("other_substitution: bench/lunch, sand/lend; not hat/had", () => {
    expect(categorize("bench", "lunch")).toBe("other_substitution");
    expect(categorize("sand", "lend")).toBe("other_substitution");
    expect(categorize("hat", "had")).not.toBe("other_substitution");
  });
});

describe("comparison", () => {
  it("improved when accuracy rises by 3+ words and categories do not worsen", () => {
    const words = [...FORM_A];
    // 9 substitutions in baseline.
    const baseIdx = [4, 6, 10, 13, 16, 19, 23, 26, 29];
    const baseWords = words.map((w, idx) => (baseIdx.includes(idx) ? "zzz" : w));
    const base = summarizeText(baseWords.join(" "), "b01");
    // Follow-up fixes 5 of them.
    const fuWords = words.map((w, idx) =>
      baseIdx.slice(0, 4).includes(idx) ? "zzz" : w
    );
    const fu = summarizeText(fuWords.join(" "), "f01");
    const c = compare(base, fu, true, true);
    expect(c.comparable).toBe(true);
    expect(c.direction).toBe("improved");
  });

  it("no_clear_change for identical attempts", () => {
    const m = summarizeText(FORM_A.join(" "));
    const c = compare(m, m, true, true);
    expect(c.direction).toBe("no_clear_change");
  });

  it("declined mirrors improved", () => {
    const good = summarizeText(FORM_A.join(" "), "b02");
    const badWords = FORM_A.map((w, idx) => ([1, 3, 5, 7, 9].includes(idx) ? "zzz" : w));
    const bad = summarizeText(badWords.join(" "), "f02");
    const c = compare(good, bad, true, true);
    expect(c.direction).toBe("declined");
  });

  it("same form is not comparable", () => {
    const m = summarizeText(FORM_A.join(" "));
    const c = compare(m, m, true, false);
    expect(c.comparable).toBe(false);
  });
});
