// Supabase browser client — uses the anon key, safe to expose client-side.
// Used for read-only analytics queries from the UI.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton pattern to avoid multiple client instances
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
