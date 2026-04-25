import { createClient } from '@supabase/supabase-js';

const accountSupabaseUrl = import.meta.env.VITE_ACCOUNT_PROJECT_URL;
const accountSupabaseKey = import.meta.env.VITE_ACCOUNT_PUBLISHABLE_KEY;

export const accountSupabase =
  accountSupabaseUrl && accountSupabaseKey
    ? createClient(accountSupabaseUrl, accountSupabaseKey)
    : null;
