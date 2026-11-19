import { cookies } from 'next/headers'
import { unstable_noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import { isValidAdminCookie } from '@/lib/admin/require-admin'
import { getBadgeSettings } from '@/lib/home-badge-settings'
import EditorPanels from '@/components/admin/EditorPanels'
import { getBannerSettings } from '@/lib/banner-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import type { GoogleProfileStats } from '@/lib/google-reviews/types'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

async function getGoogleProfile(): Promise<GoogleProfileStats | null> {
  unstable_noStore()
  try {
    const { data, error } = await createAdminClient().from('google_profile_stats').select('*').eq('id', true).single()
    if (error) throw error
    return data as GoogleProfileStats
  } catch (error) {
    console.error('[admin/editor Google profile]', error)
    return null
  }
}

export default async function EditorPage() {
  if (!isValidAdminCookie(cookies().get('admin_session')?.value)) redirect('/admin')
  const [{ settings: stats, homeFlagsReady }, banner, googleProfile] = await Promise.all([
    getBadgeSettings(), getBannerSettings(), getGoogleProfile(),
  ])
  return (
    <main>
      <h1 className="font-heading font-extrabold text-paper text-2xl sm:text-3xl mb-5">Editor</h1>
      <EditorPanels stats={stats} homeFlagsReady={homeFlagsReady} banner={banner} googleProfile={googleProfile} />
    </main>
  )
}
