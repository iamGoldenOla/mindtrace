import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function supabaseAnon(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase public env vars are not set.");
  }
  return createClient(url, anon);
}

export function supabaseForUser(accessToken: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase public env vars are not set.");
  }
  return createClient(
    url,
    anon,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
  );
}
