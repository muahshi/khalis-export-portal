import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. Bypasses RLS — server-only, never import this
 * from a "use client" module or anything under components/.
 * Used for: RFQ inserts, staff/admin reads, anything in services/.
 */
let serviceClient: SupabaseClient | null = null;

export function getSupabaseServiceClient(): SupabaseClient {
  if (serviceClient) return serviceClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase service role env vars are not configured.");
  }

  serviceClient = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serviceClient;
}

/**
 * Anon-key Supabase client for server-rendered public reads (e.g. public_products view).
 * Safe to use in Server Components — still subject to RLS.
 */
export function getSupabaseAnonServerClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Supabase public env vars are not configured.");
  }
  return createClient(url, anonKey, { auth: { persistSession: false } });
}
