"use client";
import { createClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client — anon key only, subject to RLS. Never import the
 * service-role client (lib/supabase/server.ts) into a client component.
 */
export function getSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anonKey);
}
