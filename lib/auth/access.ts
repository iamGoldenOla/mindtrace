// Application-level learner access check, enforced in every route and page
// that touches learner data. (Row-level security will enforce this again in
// the database once the Supabase backend lands.)
import { getRepository } from "@/lib/db";

export async function requireLearnerAccess(
  userId: string,
  learnerId: string,
  needWrite = false
): Promise<void> {
  const access = await getRepository().getAccess(userId, learnerId);
  if (!access) {
    throw new Error("Access denied.");
  }
  if (needWrite && access.access_role === "viewer") {
    throw new Error("Access denied.");
  }
}
