import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Klien Supabase dengan kunci publik (anon/publishable).
 * Semua batasan akses diatur oleh Row Level Security di database,
 * jadi kunci ini aman dipakai di server maupun browser.
 * Bernilai null kalau environment variable belum diisi.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, { auth: { persistSession: false } })
    : null;

export const supabaseSiap = supabase !== null;
