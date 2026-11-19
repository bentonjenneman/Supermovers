import { unstable_noStore } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { EMPTY_BANNER, validateBanner, type BannerSettings } from '@/lib/banner'

export interface BannerResult {
  banner: BannerSettings | null
  error: 'setup' | 'load' | null
}

export function isMissingBannerTable(error: { code?: string }) {
  return error.code === '42P01' || error.code === 'PGRST205'
}

export async function getBannerSettings(): Promise<BannerResult> {
  unstable_noStore()
  try {
    const { data, error } = await createAdminClient().from('site_banner')
      .select('title, subtitle, link').eq('id', true).maybeSingle()
    if (error) {
      if (isMissingBannerTable(error)) return { banner: null, error: 'setup' }
      throw error
    }
    if (!data) return { banner: EMPTY_BANNER, error: null }
    const result = validateBanner(data)
    if ('error' in result) throw new Error(result.error)
    return { banner: result.data, error: null }
  } catch (error) {
    console.error('[banner settings]', error)
    return { banner: null, error: 'load' }
  }
}
