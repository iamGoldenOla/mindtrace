// Single access point for data. Pages and routes use getRepository() only,
// so a Supabase-backed implementation can replace the local store later.
import { LocalJsonRepository, type Repository } from "./repository";

let instance: Repository | null = null;

export function getRepository(): Repository {
  if (!instance) instance = new LocalJsonRepository();
  return instance;
}

/** Test-only: drop the singleton so a fresh DATA_DIR takes effect. */
export function __resetRepository(): void {
  instance = null;
}
