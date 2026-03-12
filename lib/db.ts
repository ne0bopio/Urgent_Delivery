// ============================================================
// lib/db.ts — Supabase client (lazy initialization)
//
// FIX: The previous version threw an error at module evaluation
// time if env vars were missing. Next.js evaluates API route
// modules during `next build` to collect page data, so a
// missing env var would crash the entire build on Vercel even
// though the vars ARE set at runtime.
//
// Solution: use a getter that initializes the client on first
// use, not at import time. The error is still thrown if vars
// are missing — just at request time instead of build time.
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Add them to your Vercel environment variables."
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

// Use this everywhere instead of importing supabase directly.
// It behaves identically — just initializes on first call.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});