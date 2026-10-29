import type { SupabaseClient } from "@supabase/supabase-js";

// Re-checks learner access in the API route (RLS enforces it in the database too).
export async function requireLearnerAccess(
  db: SupabaseClient,
  userId: string,
  learnerId: string,
  needWrite = false
): Promise<void> {
  const { data, error } = await db
    .from("learner_access")
    .select("access_role, revoked_at")
    .eq("user_id", userId)
    .eq("learner_id", learnerId)
    .maybeSingle();
  if (error || !data || data.revoked_at) {
    throw new Error("Access denied.");
  }
  if (needWrite && !["owner", "contributor"].includes(data.access_role as string)) {
    throw new Error("Access denied.");
  }
}
