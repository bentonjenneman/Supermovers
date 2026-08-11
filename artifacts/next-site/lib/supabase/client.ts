import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin } catch { return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '') } })(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
