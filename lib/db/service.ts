// Server-only Supabase client with the service role.
// Never import this module from client components.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseService(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Service role must never be used in browser code.");
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !service) {
    throw new Error("Supabase service env vars are not set.");
  }
  return createClient(url, service, { auth: { persistSession: false } });
}
