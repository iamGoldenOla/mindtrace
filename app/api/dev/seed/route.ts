// DEV-ONLY seed. Rebuilds the local store with synthetic data.
// Returns 404 in production. Requires a signed-in development teacher.
// SYNTHETIC DATA. NOT REAL CHILDREN.
import { NextResponse } from "next/server";
import { align } from "@/lib/reading/align";
import { getRepository } from "@/lib/db";
import { requireDevUser, assertDevAuthAllowed } from "@/lib/auth/dev";
import type { DbShape } from "@/lib/db/repository";
import { emptyDb, newId, nowIso } from "@/lib/db/repository";
import supports from "@/content/supports.json";
import guides from "@/content/guides.json";

const FORM_A = "Sam has a red hat. The hat is on the bed. A dog sits on the mat by the shed. Then the dog digs in the sand and finds a shell.";
const FORM_B = "Tom has a tan cap. The cap is in the bag. A cat naps on the rug by the bench. Then the cat hops up the steps and finds a fish.";
const FORM_C = "Ben has a pink bib. The bib is on the chair. A pup sits on the log by the chest. Then the pup digs in the grass and finds a shell.";

function wordsOf(passage: string): string[] {
  return passage
    .toLowerCase()
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function sentencesOf(passage: string): string[] {
  return passage.split(/(?<=\.)\s+/);
}

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
  try {
    assertDevAuthAllowed();
    await requireDevUser();
  } catch {
    return NextResponse.json({ error: "Sign in to use this." }, { status: 401 });
  }

  const db: DbShape = emptyDb();
  const at = nowIso();
  const teacherA = {
    id: newId(),
    display_name: "Teacher A (synthetic)",
    role: "teacher" as const,
    email: "teacher.a@example.test",
    created_at: at,
  };
  const teacherB = {
    id: newId(),
    display_name: "Teacher B (synthetic)",
    role: "teacher" as const,
    email: "teacher.b@example.test",
    created_at: at,
  };
  db.profiles.push(teacherA, teacherB);

  const defA = {
    id: newId(), slug: "read-aloud-a", name: "Read-Aloud Form A", skill: "oral_reading",
    form: "A", language: "en", level: "early", instructions: { condition: "baseline" },
    scoring: { method: "alignment" }, target: { words: wordsOf(FORM_A), sentences: sentencesOf(FORM_A) },
    validation_status: "unvalidated", version: 1,
  };
  const defB = {
    id: newId(), slug: "read-aloud-b", name: "Read-Aloud Form B", skill: "oral_reading",
    form: "B", language: "en", level: "early", instructions: { condition: "baseline" },
    scoring: { method: "alignment" }, target: { words: wordsOf(FORM_B), sentences: sentencesOf(FORM_B) },
    validation_status: "unvalidated", version: 1,
  };
  const defC = {
    id: newId(), slug: "read-aloud-c", name: "Read-Aloud Form C", skill: "oral_reading",
    form: "C", language: "en", level: "early", instructions: { condition: "baseline" },
    scoring: { method: "alignment" }, target: { words: wordsOf(FORM_C), sentences: sentencesOf(FORM_C) },
    validation_status: "unvalidated", version: 1,
  };
  db.assessment_definitions.push(defA, defB, defC);

  function addLearner(code: string, owner: string, concern: string) {
    const learner = {
      id: newId(), code, pseudonym: null, stage: "Year 2",
      preferred_language: "en", assessment_language: "en", accessibility_prefs: {},
      created_by: owner, created_at: at,
    };
    db.learners.push(learner);
    db.learner_access.push({ user_id: owner, learner_id: learner.id, access_role: "owner" as const, granted_at: at, revoked_at: null });
    const inv = {
      id: newId(), learner_id: learner.id, concern, status: "open" as const, created_by: owner, created_at: at,
    };
    db.investigations.push(inv);
    return { learner, inv };
  }

  function addAttempt(learnerId: string, definitionId: string, transcript: string, by: string, extra?: { condition?: "baseline" | "support" | "followup"; support_strategy_id?: string | null }) {
    const attempt = {
      id: newId(), learner_id: learnerId, definition_id: definitionId, language: "en",
      condition: extra?.condition ?? ("baseline" as const),
      support_strategy_id: extra?.support_strategy_id ?? null,
      status: "completed" as const, asr_status: "seeded-synthetic",
      transcript, transcript_corrected: null, evidence_version: "evidence.v1",
      started_at: at, completed_at: at, created_by: by,
    };
    db.attempts.push(attempt);
    const def = db.assessment_definitions.find((d) => d.id === definitionId);
    const short = attempt.id.replace(/-/g, "").slice(0, 4);
    if (def) {
      const { records } = align(def.target.words, transcript, short);
      for (const r of records) {
        db.responses.push({
          id: newId(), attempt_id: attempt.id, evidence_id: r.evidenceId,
          item_ref: r.index >= 0 ? `w${r.index}` : "insertion",
          target: r.target ?? null, observed: r.observed ?? null,
          outcome: r.outcome, error_category: r.category ?? null,
          hints_used: 0, support_used: [], response_ms: null,
        });
      }
    }
    return attempt;
  }

  const l1 = addLearner("L-0001", teacherA.id, "Struggles with unfamiliar words when reading aloud.");
  const l2 = addLearner("L-0002", teacherA.id, "Reads English sounds differently; speaks another language at home.");
  const l3 = addLearner("L-0003", teacherA.id, "Very quiet during reading; little recorded so far.");
  const l4 = addLearner("L-0004", teacherB.id, "Tried chunked text; checking whether it helped.");

  db.observations.push({
    id: newId(), learner_id: l1.learner.id, author_id: teacherA.id, observed_on: "2026-10-28",
    category: "reading", context: "Guided reading group",
    behaviour: "Reads hit for hat and leaves off word endings, for example dig for digs.",
    frequency: "most sessions", source: "teacher_report", created_at: at,
  });
  db.observations.push({
    id: newId(), learner_id: l2.learner.id, author_id: teacherA.id, observed_on: "2026-10-28",
    category: "reading", context: "One-to-one reading",
    behaviour: "Reads the for da and this for dis. Retells the story well afterwards.",
    frequency: "daily", source: "observed", created_at: at,
  });
  db.observations.push({
    id: newId(), learner_id: l4.learner.id, author_id: teacherB.id, observed_on: "2026-10-27",
    category: "reading", context: "Intervention corner",
    behaviour: "Used chunked text for one week. Still skips small words.",
    frequency: "daily", source: "observed", created_at: at,
  });

  const a1 = addAttempt(l1.learner.id, defA.id,
    "Sam has a red hit. The hat is on the bed. A dog sits on the mat by the shed. Then the dog dig in the sand and finds a shell.",
    teacherA.id);
  const a2 = addAttempt(l2.learner.id, defA.id,
    "Sam has a red hat. Da hat is on da bed. A dog sits on de mat by de shed. Den da dog digs in da sand and finds a shell.",
    teacherA.id);
  const a3 = addAttempt(l3.learner.id, defA.id, "Sam has a red", teacherA.id);
  const b4 = addAttempt(l4.learner.id, defA.id,
    "Sam has a red hit. Da hat is on da bed. A dog sits. Then da dog dig in sand and find a shell.",
    teacherB.id);
  db.investigation_attempts.push(
    { investigation_id: l1.inv.id, attempt_id: a1.id },
    { investigation_id: l2.inv.id, attempt_id: a2.id },
    { investigation_id: l3.inv.id, attempt_id: a3.id },
    { investigation_id: l4.inv.id, attempt_id: b4.id },
  );

  const strat4 = {
    id: newId(), investigation_id: l4.inv.id, catalog_key: "chunked-text",
    description: "Cover all but 2 to 3 words so the learner reads a small group at a time.",
    target: "Small words skipped during reading.", rationale: "Reduce tracking load for one week.",
    start_date: "2026-10-27", status: "active" as const, created_by: teacherB.id, created_at: at,
  };
  db.support_strategies.push(strat4);
  const f4 = addAttempt(l4.learner.id, defB.id,
    "Tom has a tan cap. Da cap is in da bag. A cat naps. Then da cat hop up steps and find a fish.",
    teacherB.id, { condition: "followup", support_strategy_id: strat4.id });
  db.investigation_attempts.push({ investigation_id: l4.inv.id, attempt_id: f4.id });
  db.followups.push({
    id: newId(), support_strategy_id: strat4.id, baseline_attempt_id: b4.id,
    followup_attempt_id: f4.id, comparison: null, teacher_notes: null, decision: null, created_at: at,
  });

  const resources: DbShape["resources"] = [
    {
      id: newId(), title: "Inclusive education foundations", publisher: "UNICEF",
      url: "https://www.unicef.org/education/inclusive-education", type: "guide", language: "en",
      topics: ["inclusive_education"], audience: ["teacher"], summary: "UNICEF overview of inclusive education.",
      practical_action: "Read the overview and pick one classroom adjustment to try.",
      review_status: "unreviewed", reviewed_on: null, region: ["global"],
    },
    {
      id: newId(), title: "Teaching for neurodiversity: training videos", publisher: "British Dyslexia Association",
      url: "https://www.bdadyslexia.org.uk/advice/educators/teaching-for-neurodiversity/webinar-training-teaching-for-neurodiversity",
      type: "video", language: "en", topics: ["reading", "classroom_adjustments"], audience: ["teacher"],
      summary: "Training videos on teaching for neurodiversity.", practical_action: "Watch one video and note one strategy.",
      review_status: "unreviewed", reviewed_on: null, region: ["global"],
    },
    {
      id: newId(), title: "How one teacher opens classrooms to children with hearing loss", publisher: "UNICEF Nigeria",
      url: "https://www.unicef.org/nigeria/stories/how-one-teacher-opens-classroom-children-hearing-loss",
      type: "article", language: "en", topics: ["hearing_vision"], audience: ["teacher", "parent"],
      summary: "A classroom example of including children with hearing loss.",
      practical_action: "Try one seating or visibility change from the story.",
      review_status: "unreviewed", reviewed_on: null, region: ["global"],
    },
    {
      id: newId(), title: "Dyslexia in the classroom", publisher: "International Dyslexia Association",
      url: "https://dyslexiaida.org/dyslexia-in-the-classroom/", type: "guide", language: "en",
      topics: ["reading"], audience: ["teacher"], summary: "Classroom guidance for reading difficulties.",
      practical_action: "Pick one reading adjustment and record what happens.",
      review_status: "unreviewed", reviewed_on: null, region: ["global"],
    },
  ];
  db.resources.push(...resources);

  await getRepository().replaceAll(db);
  return NextResponse.json({
    ok: true,
    counts: {
      teachers: db.profiles.length,
      learners: db.learners.length,
      attempts: db.attempts.length,
      responses: db.responses.length,
      supports: (supports as { supports: unknown[] }).supports.length,
      guides: (guides as { guides: unknown[] }).guides.length,
      resources: db.resources.length,
    },
  });
}
