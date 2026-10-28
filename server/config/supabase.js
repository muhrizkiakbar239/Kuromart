import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } };
let admin;
let anon;

// Service role: hanya dipakai di server, melewati RLS.
export function adminClient() {
  admin ??= createClient(env.supabaseUrl, env.supabaseServiceKey, options);
  return admin;
}

// Anon key: dipakai untuk operasi login.
export function anonClient() {
  anon ??= createClient(env.supabaseUrl, env.supabaseAnonKey, options);
  return anon;
}
