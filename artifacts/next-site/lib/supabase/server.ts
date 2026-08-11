import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        )
      } catch {
        // Called from a Server Component — safe to ignore if middleware
        // is refreshing sessions.
      }
    },
  }

  return createServerClient(
    (() => { try { return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').origin } catch { return (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '') } })(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: cookieMethods },
  )
}
