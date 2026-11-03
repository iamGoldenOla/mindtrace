"use client";

import {
  BASELINE_A,
  BASELINE_CORRECT,
  EXAMPLE_STRIP,
  FOLLOWUP_B,
  FOLLOWUP_CORRECT,
  SUPPORT_NAME,
  type DemoWord,
} from "@/lib/landing-demo";

function barClass(outcome: DemoWord["outcome"]): string {
  if (outcome === "match") return "border-pine";
  if (outcome === "substitution") return "border-marigold";
  return "border-madder";
}

function TraceWords({
  words,
  label,
  staggerMs,
}: {
  words: DemoWord[];
  label: string;
  staggerMs: number;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className="flex flex-wrap gap-x-2 gap-y-4"
    >
      {words.map((w, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{ animationDelay: `${Math.round(i * staggerMs)}ms` }}
          className={`trace-seg min-w-[44px] px-1 pb-1 border-t-4 ${barClass(w.outcome)}`}
        >
          {w.outcome === "substitution" && w.heard ? (
            <span className="block text-xs text-madder">&#12296;{w.heard}&#12297;</span>
          ) : null}
          {w.outcome === "omission" ? (
            <span className="line-through decoration-madder/60">{w.word}</span>
          ) : (
            <span>{w.word}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function ExampleTrace() {
  return (
    <figure className="mt-4 rounded bg-paper p-5">
      <TraceWords
        words={EXAMPLE_STRIP}
        label="Illustrated example trace: the word hat was heard as hit; every other shown word was read as written."
        staggerMs={45}
      />
      <figcaption className="mt-3 text-sm">
        Example Trace from synthetic data: every word is evidence. The full
        Trace links each word to the report sentences that cite it.
      </figcaption>
    </figure>
  );
}

export function ComparisonDemo() {
  return (
    <figure className="mt-4 rounded bg-paper p-5">
      <p className="text-sm font-semibold">Before: Form A, baseline</p>
      <div className="mt-2">
        <TraceWords
          words={BASELINE_A}
          label={`Illustrated before trace: ${BASELINE_CORRECT} of 31 words read as written.`}
          staggerMs={12}
        />
      </div>
      <p className="mt-5 text-sm font-semibold">
        After: Form B, with {SUPPORT_NAME}
      </p>
      <div className="mt-2">
        <TraceWords
          words={FOLLOWUP_B}
          label={`Illustrated after trace: ${FOLLOWUP_CORRECT} of 31 words read as written.`}
          staggerMs={12}
        />
      </div>
      <figcaption className="mt-4 text-sm">
        After {SUPPORT_NAME}, {FOLLOWUP_CORRECT} of 31 words were read as
        written, up from {BASELINE_CORRECT} of 31 on a comparable passage.
        This does not show that the support caused the change.
      </figcaption>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm" aria-label="Trace legend">
        <li>
          <span className="mr-1 inline-block h-0 w-4 border-t-4 border-pine align-middle" />{" "}
          Read as written
        </li>
        <li>
          <span className="mr-1 inline-block h-0 w-4 border-t-4 border-marigold align-middle" />{" "}
          Read differently (heard word shown)
        </li>
        <li>
          <span className="mr-1 inline-block h-0 w-4 border-t-4 border-madder align-middle" />{" "}
          Skipped
        </li>
      </ul>
      <p className="mt-3 text-sm text-ink/80">
        Illustrated example with synthetic data. Forms A and B are matched by
        design; difficulty equivalence is not validated.
      </p>
    </figure>
  );
}
