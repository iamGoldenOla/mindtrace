import { describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Live RLS isolation tests. They need a real Supabase project with
// supabase/migrations/0001_init.sql applied and supabase/seed.sql applied
// with the placeholder teacher UUIDs replaced by the real auth.users ids.
// Provide four env vars to run; otherwise the suite skips (never fake a pass).
//
//   SUPABASE_TEST_URL        e.g. https://<ref>.supabase.co
//   SUPABASE_TEST_ANON_KEY   the project's publishable anon key
//   SUPABASE_TEST_TOKEN_A    access JWT for teacher.a@example.test
//   SUPABASE_TEST_TOKEN_B    access JWT for teacher.b@example.test
//
// Mint a token (run on your machine, never commit the output):
//   curl -s -X POST "$SUPABASE_TEST_URL/auth/v1/token?grant_type=password" \
//     -H "apikey: $SUPABASE_TEST_ANON_KEY" -H "Content-Type: application/json" \
//     -d '{"email":"teacher.a@example.test","password":"<password>"}'
// and read .access_token from the JSON.
//
// Viewer and revoke cases need one grant row each, and clients have no
// insert policy on learner_access by design, so run these once in the
// Supabase SQL editor (replace <B-UUID> with teacher B's auth.users id):
//   -- viewer grant: B can read L-0001 but still cannot insert observations
//   insert into learner_access(user_id, learner_id, access_role)
//   select '<B-UUID>', id, 'viewer' from learners where code = 'L-0001';
//   -- revoke: B immediately loses read access again
//   update learner_access set revoked_at = now()
//   where user_id = '<B-UUID>'
//     and learner_id = (select id from learners where code = 'L-0001');

const url = process.env.SUPABASE_TEST_URL;
const anon = process.env.SUPABASE_TEST_ANON_KEY;
const tokenA = process.env.SUPABASE_TEST_TOKEN_A;
const tokenB = process.env.SUPABASE_TEST_TOKEN_B;
const canRun = !!url && !!anon && !!tokenA && !!tokenB;

function client(token: string): SupabaseClient {
  return createClient(url as string, anon as string, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function sub(token: string): string {
  return JSON.parse(
    Buffer.from(token.split(".")[1], "base64").toString("utf8"),
  ).sub as string;
}

describe.runIf(canRun)("rls isolation (live)", () => {
  it("teacher B cannot read teacher A's learner or its observations", async () => {
    const a = client(tokenA as string);
    const b = client(tokenB as string);

    const own = await a.from("learners").select("id,code").eq("code", "L-0001");
    expect(own.error).toBeNull();
    expect(own.data).toHaveLength(1);

    const foreign = await b
      .from("learners")
      .select("id,code")
      .eq("code", "L-0001");
    expect(foreign.error).toBeNull();
    expect(foreign.data).toHaveLength(0);

    const learnerId = (own.data as { id: string }[])[0].id;
    const obs = await b
      .from("observations")
      .select("id")
      .eq("learner_id", learnerId);
    expect(obs.error).toBeNull();
    expect(obs.data).toHaveLength(0);
  });

  it("a teacher with no grant cannot insert observations on L-0001", async () => {
    const a = client(tokenA as string);
    const b = client(tokenB as string);

    const own = await a.from("learners").select("id").eq("code", "L-0001");
    expect(own.error).toBeNull();
    const learnerId = (own.data as { id: string }[])[0].id;

    const attempt = await b.from("observations").insert({
      learner_id: learnerId,
      author_id: sub(tokenB as string),
      behaviour: "rls probe (must be rejected)",
      source: "observed",
    });
    expect(attempt.error).not.toBeNull();
    expect(attempt.error?.code).toBe("42501");

    const after = await a
      .from("observations")
      .select("id")
      .eq("learner_id", learnerId)
      .eq("behaviour", "rls probe (must be rejected)");
    expect(after.error).toBeNull();
    expect(after.data).toHaveLength(0);
  });
});

describe.skipIf(canRun)("rls isolation (no live project)", () => {
  it("records that live RLS checks are pending", () => {
    expect(canRun).toBe(false);
  });
});
