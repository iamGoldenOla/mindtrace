// Single access point for data. Pages and routes use getRepository() only,
// so the storage backend can change without touching callers.
//
// Backend choice: Supabase Postgres when the service env vars are set
// (deployment and any local run pointed at a live project), otherwise the
// local JSON store. Both implement the same Repository interface, and
// per-learner authorisation is enforced by requireLearnerAccess either way.
// Server-only: the Supabase backend uses the service-role key.
import { LocalJsonRepository, type Repository } from "./repository";
import { supabaseService } from "./service";
import { SupabaseRepository } from "./supabase-repository";

let instance: Repository | null = null;

export function supabaseConfigured(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

export function getRepository(): Repository {
  if (!instance) {
    instance = supabaseConfigured()
      ? new SupabaseRepository(supabaseService())
      : new LocalJsonRepository();
  }
  return instance;
}

/** Test-only: drop the singleton so a fresh DATA_DIR or backend takes effect. */
export function __resetRepository(): void {
  instance = null;
}
