// Report schema report.v1 plus the code-enforced rules from AI_SPEC.md.
// The model proposes; this module disposes.
import { z } from "zod";

export const SCHEMA_VERSION = "report.v1";

const EvidenceRef = z.string().regex(/^E-[a-z0-9]+-[a-z0-9]+$/);

export const ReportSchema = z.object({
  schema_version: z.literal("report.v1"),
  concern_summary: z.string().max(400),
  observed_evidence: z
    .array(z.object({ statement: z.string().max(240), evidence: z.array(EvidenceRef).min(1) }))
    .max(8),
  skill_patterns: z
    .array(
      z.object({
        pattern: z.string().max(240),
        evidence: z.array(EvidenceRef).min(1),
        strength: z.enum(["weak", "moderate", "strong"]),
      })
    )
    .max(5),
  patterns_worth_exploring: z
    .array(
      z.object({
        description: z.string().max(280),
        basis: z.array(EvidenceRef).min(1),
        cautions: z.string().max(240),
      })
    )
    .max(3),
  possible_explanations: z
    .array(
      z.object({
        explanation: z.string().max(240),
        supports: z.array(EvidenceRef),
        would_weaken: z.string().max(200),
        confidence: z.enum(["low", "moderate", "high"]),
      })
    )
    .min(2)
    .max(5),
  alternative_explanations: z.array(z.string().max(200)).min(1).max(5),
  missing_information: z.array(z.string().max(200)).max(6),
  recommended_supports: z
    .array(
      z.object({
        support_key: z.string(),
        why: z.string().max(240),
        how_to_try: z.string().max(300),
        how_to_evaluate: z.string().max(240),
        addresses: z.array(EvidenceRef).min(1),
      })
    )
    .min(1)
    .max(4),
  resource_recommendations: z
    .array(z.object({ resource_id: z.string().uuid(), reason: z.string().max(160) }))
    .max(4),
  referral_guidance: z.object({
    consider_referral: z.enum([
      "not_indicated_by_current_evidence",
      "monitor_and_review",
      "consider_discussing_with_a_qualified_professional",
    ]),
    rationale: z.string().max(300),
  }),
  follow_up_plan: z.object({
    form: z.enum(["A", "B", "C"]),
    support_key: z.string(),
    review_after_days: z.number().int().min(3).max(60),
    what_to_observe: z.string().max(240),
  }),
  limitations: z.array(z.string().max(200)).min(2),
  insufficient_evidence: z.boolean(),
});

export type ReportV1 = z.infer<typeof ReportSchema>;

export interface CodeCheckInput {
  report: ReportV1;
  evidenceIds: Set<string>;
  supportKeys: Set<string>;
  resourceIds: Set<string>;
  attemptCount: number;
  teacherObservationCount: number;
}

/** Rules enforced by code after parsing (AI_SPEC.md section 4). */
export function checkReportRules(input: CodeCheckInput): string[] {
  const problems: string[] = [];
  const { report } = input;
  const allRefs: string[] = [
    ...report.observed_evidence.flatMap((o) => o.evidence),
    ...report.skill_patterns.flatMap((s) => s.evidence),
    ...report.patterns_worth_exploring.flatMap((p) => p.basis),
    ...report.possible_explanations.flatMap((e) => e.supports),
    ...report.recommended_supports.flatMap((s) => s.addresses),
  ];
  for (const ref of allRefs) {
    if (!input.evidenceIds.has(ref)) problems.push(`Unknown evidence ID: ${ref}.`);
  }
  for (const s of report.recommended_supports) {
    if (!input.supportKeys.has(s.support_key)) problems.push(`Unknown support key: ${s.support_key}.`);
  }
  if (!input.supportKeys.has(report.follow_up_plan.support_key)) {
    problems.push(`Unknown follow-up support key: ${report.follow_up_plan.support_key}.`);
  }
  for (const r of report.resource_recommendations) {
    if (!input.resourceIds.has(r.resource_id)) problems.push(`Unknown resource: ${r.resource_id}.`);
  }
  if (report.insufficient_evidence) {
    for (const s of report.skill_patterns) {
      if (s.strength === "strong") problems.push("Strong pattern claimed despite insufficient evidence.");
    }
  }
  if (report.referral_guidance.consider_referral === "consider_discussing_with_a_qualified_professional") {
    if (input.attemptCount < 2 || input.teacherObservationCount < 1) {
      problems.push("Referral wording needs evidence from at least two attempts plus a teacher observation.");
    }
  }
  return Array.from(new Set(problems));
}
