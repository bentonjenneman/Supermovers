import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerEnv } from '@/lib/env'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const sessionSecret = getServerEnv('ADMIN_SESSION_SECRET')
  if (
    !sessionSecret ||
    request.cookies.get('admin_session')?.value !== sessionSecret
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const configuredUrl = getServerEnv('NEXT_PUBLIC_SUPABASE_URL')
  const serviceRoleKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY')
  const result: Record<string, unknown> = {
    bindings: {
      urlPresent: Boolean(configuredUrl),
      serviceRoleKeyPresent: Boolean(serviceRoleKey),
    },
  }

  if (!configuredUrl || !serviceRoleKey) {
    return NextResponse.json(result)
  }

  let origin: string
  try {
    origin = new URL(configuredUrl).origin
    result.urlValid = true
  } catch {
    result.urlValid = false
    return NextResponse.json(result)
  }

  try {
    const response = await fetch(`${origin}/rest/v1/quotes?select=id&limit=1`, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    })
    result.nativeFetch = { ok: response.ok, status: response.status }
  } catch (error) {
    result.nativeFetch = {
      threw: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  try {
    const client = createClient(origin, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
    const { error } = await client.from('quotes').select('id').limit(1)
    result.supabaseClient = error
      ? { ok: false, code: error.code, message: error.message }
      : { ok: true }
  } catch (error) {
    result.supabaseClient = {
      threw: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }

  return NextResponse.json(result)
}