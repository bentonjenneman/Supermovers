import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { isValidAdminCookie } from '@/lib/admin/require-admin'
import BlogAdmin from '@/components/admin/blog/BlogAdmin'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export default function BlogAdminPage() {
  if (!isValidAdminCookie(cookies().get('admin_session')?.value)) redirect('/admin')
  return <BlogAdmin />
}
