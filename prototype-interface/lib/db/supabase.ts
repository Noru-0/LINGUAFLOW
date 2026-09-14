import { createClient } from '@supabase/supabase-js'

if (typeof window === 'undefined' && !(globalThis as any).WebSocket) {
  (globalThis as any).WebSocket = class DummyWebSocket {}
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

const clientOptions = {
  auth: { persistSession: false },
}

// Client for public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, clientOptions)

// Client for server-side admin operations (bypasses RLS when needed)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, clientOptions)

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}
