---
name: Next.js Data Cache + Supabase
description: force-dynamic alone doesn't bust the Next.js Data Cache for Supabase client fetch calls — must use unstable_noStore() inside each fetching function body.
---

# Next.js 14 Data Cache + Supabase

## The Rule
`export const dynamic = 'force-dynamic'` on a page/layout disables the **Full Route Cache** but does NOT reliably opt out the **Data Cache** for `fetch()` calls made by `@supabase/supabase-js`. Pages can still return stale data (sub-30ms responses) while Supabase has fresh rows.

**Why:** Next.js 14's Data Cache caches fetch responses independently of the Full Route Cache. The Supabase JS client uses native `fetch` under the hood; that fetch can be cached by Next.js at the response level even when the page itself is marked dynamic.

## The Fix
Call `unstable_noStore()` from `'next/cache'` at the top of every async data-fetching function that touches Supabase:

```typescript
import { unstable_noStore } from 'next/cache'

async function getQuotes() {
  unstable_noStore()           // ← required; import alone is not enough
  const supabase = createAdminClient()
  const { data } = await supabase.from('quotes').select('*')
  ...
}
```

Keep `export const dynamic = 'force-dynamic'` too — belt-and-suspenders.

## How to Apply
Any Next.js App Router Server Component page or layout that reads from Supabase and must show live data. Applied to all four admin dashboard files:
- `app/admin/dashboard/layout.tsx` — `getCounts()`
- `app/admin/dashboard/quotes/page.tsx` — `getQuotes()`
- `app/admin/dashboard/reviews/page.tsx` — `getReviews()`
- `app/admin/dashboard/tracking/page.tsx` — `getTrackingData()`

## Symptom to Watch For
Admin page load time <30ms = Data Cache hit (stale). Load time >200ms = live Supabase fetch (correct).
