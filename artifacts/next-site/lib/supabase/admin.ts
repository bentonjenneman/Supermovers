import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from '@/lib/env'

/**
 * Service-role Supabase client — bypasses Row Level Security.
 * Only use server-side; never expose to the browser.
 */
export function createAdminClient() {
  const url =
    getServerEnv('SUPABASE_URL') ??
    getServerEnv('NEXT_PUBLIC_SUPABASE_URL')
  const key = getServerEnv('SUPABASE_SERVICE_ROLE_KEY')

  if (!url || !key) {
    throw new Error(
      'Missing Supabase service role configuration (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)',
    )
  }

  // Normalize to origin only — strips any accidental /rest/v1 path suffix
  let cleanUrl: string
  try {
    cleanUrl = new URL(url).origin
  } catch {
    cleanUrl = url.replace(/\/$/, '')
  }

  return createClient(cleanUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
