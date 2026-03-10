import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const assertSupabaseConfig = (): { url: string; anonKey: string } => {
  const missing: string[] = [];

  if (!SUPABASE_URL) missing.push("VITE_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) missing.push("VITE_SUPABASE_ANON_KEY");

  if (missing.length) {
    throw new Error(`Missing Supabase environment variables: ${missing.join(", ")}`);
  }

  return { url: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY };
};

let supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient => {
  if (supabaseClient) return supabaseClient;

  const { url, anonKey } = assertSupabaseConfig();
  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabaseClient;
};

export const supabase = getSupabaseClient();
