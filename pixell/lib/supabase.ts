import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://sobhmavdtbxjtbtwbewt.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "sb_publishable_y9Yqz1pwZMISl0s22d51_Q_WZdpJ0M7";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export const STORAGE_BUCKET =
  process.env.NEXT_PUBLIC_STORAGE_BUCKET || "itfest";

