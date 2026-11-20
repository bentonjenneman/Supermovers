// Isolated route contract tests: never connect to Supabase or change real reviews.
const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

const root = path.resolve(__dirname, '..')
function load(file, mocks = {}, environment = {}) {
  const source = ts.transpileModule(fs.readFileSync(path.join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const exports = {}
  vm.runInNewContext(source, {
    exports, require: (name) => {
      if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`)
      return mocks[name]
    },
    process: { env: environment }, URL, Date,
    console: { error() {} },
  }, { filename: file })
  return exports
}

const response = { NextResponse: { json: (body, options) => ({ status: options?.status ?? 200, body }) } }
const validation = load('lib/google-reviews/validation.ts')
const bannerValidation = load('lib/banner.ts')
const auth = load('lib/admin/require-admin.ts', { 'next/server': response }, { ADMIN_SESSION_SECRET: 'test-secret' })
const uuid = '12345678-1234-abcd-5678-123456789abc'
const request = (body, authenticated = true, malformed = false) => ({
  cookies: { get: () => authenticated ? { value: 'test-secret' } : undefined },
  json: async () => { if (malformed) throw new Error('Malformed'); return body },
})

function setup(file, results = [], configurationFails = false) {
  const calls = []
  const client = {
    from(table) {
      const result = results.shift() ?? { data: [], error: null }
      const chain = {}
      for (const method of ['select', 'insert', 'upsert', 'update', 'delete', 'eq', 'single', 'maybeSingle']) {
        chain[method] = (...args) => { calls.push({ table, method, args }); return chain }
      }
      chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
      return chain
    },
  }
  const routes = load(file, {
    'next/server': response,
    '@/lib/admin/require-admin': auth,
    '@/lib/google-reviews/validation': validation,
    '@/lib/banner': bannerValidation,
    '@/lib/banner-settings': { isMissingBannerTable: error => ['42P01', 'PGRST205'].includes(error.code) },
    '@/lib/supabase/admin': { createAdminClient() {
      if (configurationFails) throw new Error('Private configuration detail')
      return client
    } },
  })
  return { routes, calls }
}

const collection = 'app/api/admin/google-reviews/route.ts'
const item = 'app/api/admin/google-reviews/[id]/route.ts'
const profile = 'app/api/admin/google-profile/route.ts'
const validReview = { reviewer_name: ' Test reviewer ', star_rating: 5, review_created_at: '2024-02-29', comment: ' Exact words ' }
const validProfile = { reviews_url: 'https://g.page/example', write_review_url: null, average_rating: 4.86, total_review_count: 12 }
const context = { params: { id: uuid } }
const badges = 'app/api/admin/reviews-badges/route.ts'
const bannerRoute = 'app/api/admin/banner/route.ts'

test('Editor displays Google profile fields alongside both badges, and Reviews keeps review management only', () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const uiMocks = {
    react: React,
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/navigation': { useRouter: () => ({}) },
    '@/components/ui/Button': { default: ({ children, ...props }) => React.createElement('button', props, children) },
  }
  const utils = load('components/admin/google-reviews/utils.ts')
  const profilePanel = load('components/admin/google-reviews/ProfilePanel.tsx', { ...uiMocks, './utils': utils })
  const badge = load('components/GoogleReviewsBadge.tsx', uiMocks)
  const leaveBadge = load('components/LeaveGoogleReviewBadge.tsx', uiMocks)
  const editor = load('components/admin/EditorPanels.tsx', {
    ...uiMocks,
    './google-reviews/utils': utils,
    './google-reviews/ProfilePanel': profilePanel,
    '@/components/GoogleReviewsBadge': badge,
    '@/components/LeaveGoogleReviewBadge': leaveBadge,
    './BannerPanel': { default: () => null },
  })
  const stats = { badge_enabled: true, google_badge_enabled: false, show_satisfaction_badge_home: false, show_google_badge_home: true }
  const renderEditor = googleProfile => renderToStaticMarkup(React.createElement(editor.default, { stats, homeFlagsReady: true, googleProfile }))
  const html = renderEditor({ ...validProfile, average_rating: 4.7, total_review_count: 300, stats_source: 'manual' })
  assert.equal((html.match(/type="checkbox"/g) ?? []).length, 6)
  assert.match(html, /Google Reviews, 4\.7 out of 5 stars, 300\+ reviews.*Google badge and profile settings.*https:\/\/g\.page\/example/)
  assert.match(html, /Leave-a-review link/)
  assert.match(html, /Average rating/)
  assert.match(html, /Review count/)
  const unavailable = renderEditor(null)
  assert.match(unavailable, /load Google badge settings/)
  assert.doesNotMatch(unavailable, /id="gp-reviews"/)

  const reviews = load('components/admin/GoogleReviewsAdmin.tsx', {
    ...uiMocks,
    './google-reviews/utils': utils,
    './google-reviews/AddReviewPanel': { default: () => React.createElement('p', null, 'Add a review') },
  })
  const reviewsHtml = renderToStaticMarkup(React.createElement(reviews.default, { reviews: [], stats: null }))
  assert.match(reviewsHtml, /Add a review.*Pending.*Published.*Hidden/)
  assert.doesNotMatch(reviewsHtml, /Google badge and profile settings|id="gp-reviews"/)
})

test('review invitation badge links to the supplied URL and hides its label below desktop width', () => {
  const { jsx } = require('react/jsx-runtime')
  const { renderToStaticMarkup } = require('react-dom/server')
  const badge = load('components/LeaveGoogleReviewBadge.tsx', { 'react/jsx-runtime': require('react/jsx-runtime') })
  const render = href => renderToStaticMarkup(jsx(badge.default, { href }))
  assert.match(render(null), /href="https:\/\/g.page\/r\/CXTwRL-orU0jEBM\/review"/)
  assert.match(render('https://g.page/custom/review'), /href="https:\/\/g.page\/custom\/review"/)
  assert.match(render(null), /src="\/google-g.png"/)
  assert.match(render(null), /hidden whitespace-nowrap.*md:inline/)
})

test('new review invitation visibility saves independently and rejects non-boolean values', async () => {
  const body = { badge_enabled: true, google_badge_enabled: true, show_leave_review_badge_home: true, show_leave_review_badge_reviews: false }
  const { routes, calls } = setup(badges)
  assert.equal((await routes.PUT(request(body))).status, 200)
  const saved = calls.find(c => c.method === 'update').args[0]
  assert.equal(saved.show_leave_review_badge_home, true)
  assert.equal(saved.show_leave_review_badge_reviews, false)
  assert.equal(saved.google_badge_enabled, true)
  const invalid = setup(badges)
  assert.equal((await invalid.routes.PUT(request({ ...body, show_leave_review_badge_home: 'yes' }))).status, 400)
  assert.equal(invalid.calls.length, 0)
})

test('Google badge renders a partial star and count from saved stats without inventing missing numbers', () => {
  const { jsx } = require('react/jsx-runtime')
  const { renderToStaticMarkup } = require('react-dom/server')
  const badge = load('components/GoogleReviewsBadge.tsx', { 'react/jsx-runtime': require('react/jsx-runtime') })
  const render = stats => renderToStaticMarkup(jsx(badge.default, { stats }))
  const html = render({ average_rating: 4.7, total_review_count: 327 })
  assert.match(html, /4\.7 out of 5 stars, 300\+ reviews/)
  const text = markup => markup.match(/<text\b[^>]*>(.*?)<\/text>/)[1].replace(/<[^>]+>/g, '')
  assert.equal(text(html), '4.7 Rating on 300+ Reviews')
  assert.equal(text(render({ average_rating: 4.9, total_review_count: 204 })), '4.9 Rating on 200+ Reviews')
  assert.ok((html.match(/<svg width="([\d.]+)"/g) ?? []).some(markup => Math.abs(Number(markup.match(/"([\d.]+)"/)[1]) - 35) < .001))
  assert.match(render({ total_review_count: 42 }), /Google Reviews, 42 reviews/)
  assert.match(render(null), /aria-label="Google Reviews"/)
  assert.doesNotMatch(render(null), /<polygon/)
})

test('banner saves authenticate first and reject malformed data and unsafe links without writing', async () => {
  const { routes, calls } = setup(bannerRoute)
  assert.equal((await routes.PUT(request({}, false, true))).status, 401)
  assert.equal((await routes.PUT(request(null, true, true))).status, 400)
  for (const body of [
    null, [], {}, { title: 1, subtitle: '', link: '' },
    { title: 'x'.repeat(161), subtitle: '', link: '' },
    { title: 'Title', subtitle: 'x'.repeat(301), link: '' },
    ...['javascript:alert(1)', 'data:text/html,unsafe', '//evil.example', '/\\evil.example', 'https://user:secret@example.com', '/quote\nbad', 'https://example.com/' + 'x'.repeat(2048)]
      .map(link => ({ title: 'Title', subtitle: '', link })),
  ]) assert.equal((await routes.PUT(request(body))).status, 400)
  assert.equal(calls.length, 0)
})

test('banner saves edit or clear one singleton and only store allowed settings', async () => {
  for (const link of ['', '/quote', '/reviews?from=banner#reviews', 'https://example.com/offer']) {
    const { routes, calls } = setup(bannerRoute)
    const result = await routes.PUT(request({ title: ' Title ', subtitle: ' Subtitle ', link, id: false, ignored: 'not saved' }))
    assert.equal(result.status, 200)
    const saved = calls.find(call => call.method === 'upsert').args
    assert.equal(JSON.stringify(saved[0]), JSON.stringify({ id: true, title: 'Title', subtitle: 'Subtitle', link }))
    assert.equal(saved[1].onConflict, 'id')
    assert.equal(result.body.banner.title, 'Title')
  }
  const { routes } = setup(bannerRoute)
  const hidden = await routes.PUT(request({ title: ' ', subtitle: '', link: '' }))
  assert.equal(hidden.status, 200)
  assert.equal(hidden.body.banner.title, '')
})

test('banner save reports missing setup and hides private database or configuration failures', async () => {
  const values = { title: 'Title', subtitle: '', link: '' }
  const missing = setup(bannerRoute, [{ data: null, error: { code: 'PGRST205' } }])
  assert.equal((await missing.routes.PUT(request(values))).status, 503)
  for (const failed of [
    setup(bannerRoute, [{ data: null, error: { message: 'Private SQL detail' } }]),
    setup(bannerRoute, [], true),
  ]) {
    const result = await failed.routes.PUT(request(values))
    assert.equal(result.status, 500)
    assert.ok(!JSON.stringify(result.body).includes('Private'))
  }
})

test('banner reads bypass cache and handle empty settings, missing setup, and failures explicitly', async () => {
  for (const result of [
    { data: null, error: null },
    { data: { title: ' Saved ', subtitle: ' Sub ', link: '/quote' }, error: null },
    { data: null, error: { code: 'PGRST205' } },
    { data: null, error: { code: 'unknown' } },
  ]) {
    let noStoreCalls = 0
    const chain = { select: () => chain, eq: () => chain, maybeSingle: async () => result }
    const helper = load('lib/banner-settings.ts', {
      'next/cache': { unstable_noStore: () => noStoreCalls++ },
      '@/lib/supabase/admin': { createAdminClient: () => ({ from: table => { assert.equal(table, 'site_banner'); return chain } }) },
      '@/lib/banner': bannerValidation,
    })
    const read = await helper.getBannerSettings()
    assert.equal(noStoreCalls, 1)
    if (result.error) {
      assert.equal(read.banner, null)
      assert.equal(read.error, result.error.code === 'PGRST205' ? 'setup' : 'load')
    } else {
      assert.equal(read.error, null)
      assert.equal(read.banner.title, result.data ? 'Saved' : '')
    }
  }
})

test('banner rendering hides empty titles, escapes text, and supports optional internal or external links', () => {
  const React = require('react')
  const { renderToStaticMarkup } = require('react-dom/server')
  const { default: HomeBanner } = load('components/home/HomeBanner.tsx', {
    'react/jsx-runtime': require('react/jsx-runtime'),
    'next/link': { default: props => React.createElement('a', props) },
  })
  const render = banner => renderToStaticMarkup(React.createElement(HomeBanner, { banner }))
  assert.equal(render(null), '')
  assert.equal(render({ title: '', subtitle: 'Still hidden', link: '/quote' }), '')
  const plain = render({ title: '<Not HTML>', subtitle: 'Details', link: '' })
  assert.ok(plain.includes('&lt;Not HTML&gt;'))
  assert.ok(!plain.includes('<a '))
  const internal = render({ title: 'Offer', subtitle: '', link: '/quote' })
  assert.ok(internal.includes('href="/quote"'))
  assert.ok(!internal.includes('target="_blank"'))
  const external = render({ title: 'Offer', subtitle: 'Details', link: 'https://example.com/' })
  assert.ok(external.includes('target="_blank"'))
  assert.ok(external.includes('rel="noopener noreferrer"'))
})

test('badge settings require authentication and reject malformed home flags', async () => {
  const { routes, calls } = setup(badges)
  const base = { badge_enabled: true, google_badge_enabled: true }
  assert.equal((await routes.PUT(request(base, false))).status, 401)
  assert.equal((await routes.PUT(request(null, true, true))).status, 400)
  for (const home of [
    { show_satisfaction_badge_home: true },
    { show_google_badge_home: false },
    { show_satisfaction_badge_home: 'true', show_google_badge_home: true },
    { show_satisfaction_badge_home: false, show_google_badge_home: null },
  ]) assert.equal((await routes.PUT(request({ ...base, ...home }))).status, 400)
  assert.equal(calls.length, 0)
})

test('home badge flags save independently and do not rewrite Reviews visibility', async () => {
  for (const satisfaction of [true, false]) for (const google of [true, false]) {
    const { routes, calls } = setup(badges)
    const values = {
      badge_enabled: false, google_badge_enabled: true,
      show_satisfaction_badge_home: satisfaction, show_google_badge_home: google,
    }
    assert.equal((await routes.PUT(request({ ...values, ignored: 'not saved' }))).status, 200)
    assert.equal(JSON.stringify(calls.find(call => call.method === 'update').args[0]), JSON.stringify(values))
  }
})

test('legacy Reviews-only saves remain usable before the owner runs the home flags SQL', async () => {
  const { routes, calls } = setup(badges)
  const values = { badge_enabled: true, google_badge_enabled: false }
  assert.equal((await routes.PUT(request(values))).status, 200)
  assert.equal(JSON.stringify(calls.find(call => call.method === 'update').args[0]), JSON.stringify(values))
  const failure = setup(badges, [{ data: null, error: { message: 'private SQL detail' } }])
  const result = await failure.routes.PUT(request(values))
  assert.equal(result.status, 500)
  assert.ok(!JSON.stringify(result.body).includes('private SQL detail'))
})

test('home badge reads are uncached, default off before SQL, and use saved flags afterward', async () => {
  for (const migrated of [false, true]) {
    let noStoreCalls = 0
    const results = migrated
      ? [{ data: { badge_enabled: false, google_badge_enabled: false, show_satisfaction_badge_home: true, show_google_badge_home: false, reviews_url: 'https://www.google.com/maps/example-profile', average_rating: 4.7, total_review_count: 300 }, error: null }]
      : [
        { data: null, error: { code: '42703', message: 'column google_profile_stats.show_satisfaction_badge_home does not exist' } },
        { data: { badge_enabled: true, google_badge_enabled: true, reviews_url: 'https://www.google.com/maps/example-profile' }, error: null },
      ]
    const helper = load('lib/home-badge-settings.ts', {
      'next/cache': { unstable_noStore() { noStoreCalls++ } },
      '@/lib/supabase/admin': { createAdminClient: () => ({
        from() {
          const result = results.shift()
          const chain = { select: () => chain, eq: () => chain, single: async () => result }
          return chain
        },
      }) },
    })
    const flags = await helper.getHomeBadgeSettings()
    assert.equal(flags.show_satisfaction_badge_home, migrated)
    assert.equal(flags.show_google_badge_home, false)
    assert.equal(flags.reviews_url, 'https://www.google.com/maps/example-profile')
    assert.equal(flags.average_rating, migrated ? 4.7 : null)
    assert.equal(flags.total_review_count, migrated ? 300 : null)
    assert.equal(noStoreCalls, 1)
    assert.equal(results.length, 0)
  }
})

test('home reviews request only three published, non-removed reviews without changing their words', async () => {
  const calls = []
  let noStoreCalls = 0
  const result = {
    data: [{ id: 'review-id', reviewer_name: ' Customer ', star_rating: 4, comment: 'Original words.\nSecond line.', review_created_at: '2026-11-01T12:00:00Z' }],
    error: null,
  }
  const chain = {}
  for (const method of ['select', 'eq', 'order', 'limit']) {
    chain[method] = (...args) => { calls.push({ method, args }); return chain }
  }
  chain.then = (resolve, reject) => Promise.resolve(result).then(resolve, reject)
  const helper = load('lib/google-reviews/home.ts', {
    'next/cache': { unstable_noStore() { noStoreCalls++ } },
    '@/lib/supabase/admin': { createAdminClient: () => ({ from(table) { assert.equal(table, 'google_reviews'); return chain } }) },
    './public': { relativeDateLabel: () => 'date label' },
  })
  const reviews = await helper.getHomeReviews()
  assert.equal(noStoreCalls, 1)
  assert.ok(calls.some(call => call.method === 'eq' && call.args[0] === 'status' && call.args[1] === 'published'))
  assert.ok(calls.some(call => call.method === 'eq' && call.args[0] === 'removed_from_google' && call.args[1] === false))
  assert.ok(calls.some(call => call.method === 'limit' && call.args[0] === 3))
  assert.equal(reviews.length, 1)
  assert.equal(reviews[0].comment, result.data[0].comment)
  assert.equal(reviews[0].rating, 4)
  result.data = []
  assert.equal((await helper.getHomeReviews()).length, 0)
  result.error = { message: 'database unavailable' }
  assert.equal(await helper.getHomeReviews(), null)
})

test('admin cookie fails closed with absent, empty or unequal secrets', () => {
  for (const value of [undefined, null, '', 'bad', 'test-secreu']) assert.equal(auth.isValidAdminCookie(value), false)
  assert.equal(auth.isValidAdminCookie('test-secret'), true)
  const unset = load('lib/admin/require-admin.ts', { 'next/server': response })
  assert.equal(unset.isValidAdminCookie('test-secret'), false)
  assert.equal(unset.isValidAdminCookie(''), false)
})

test('Google links require HTTPS and an exact domain or genuine subdomain', () => {
  for (const url of ['https://google.com/maps', 'https://maps.google.com/x', 'https://g.page/x', 'https://goo.gl/x', 'https://g.co/x']) {
    assert.equal(validation.isAllowedGoogleUrl(url), true, url)
  }
  for (const url of ['http://google.com', 'javascript:alert(1)', 'data:text/html,x', 'https://evilgoogle.com', 'https://google.com.evil.org', 'https://google.com@evil.org', 'nonsense']) {
    assert.equal(validation.isAllowedGoogleUrl(url), false, url)
  }
})

test('text, UUID and calendar date validation', () => {
  assert.equal(validation.cleanText(' name ', 4), 'name')
  for (const value of ['', '  ', 2, null, 'abcde']) assert.equal(validation.cleanText(value, 4), null)
  assert.equal(validation.isUuid(uuid.toUpperCase()), true)
  assert.equal(validation.isUuid('bad'), false)
  assert.equal(validation.reviewDate('2024-02-29'), '2024-02-29T12:00:00.000Z')
  for (const value of ['2023-02-29', '2024-02-30', '2024-13-01', '2009-12-31', '2999-01-01', '2024-1-1', null]) {
    assert.equal(validation.reviewDate(value), null, String(value))
  }
})

for (const [file, method] of [[collection, 'POST'], [item, 'PATCH'], [item, 'DELETE'], [profile, 'PUT']]) {
  test(`${method} ${file} authenticates before any parsing or DB access`, async () => {
    const { routes, calls } = setup(file, [], true)
    const result = await routes[method](request(null, false, true), context)
    assert.equal(result.status, 401)
    assert.equal(result.body.error, 'Unauthorized')
    assert.equal(calls.length, 0)
  })
  test(`${method} ${file} hides configuration failures`, async () => {
    const { routes } = setup(file, [], true)
    const result = await routes[method](request(method === 'PUT' ? validProfile : method === 'POST' ? validReview : { status: 'hidden' }), context)
    assert.equal(result.status, 500)
    assert.equal(result.body.error, 'Something went wrong. Please try again.')
  })
}

test('POST inserts only validated, server-owned published manual fields', async () => {
  const { routes, calls } = setup(collection, [{ data: { id: uuid }, error: null }])
  const result = await routes.POST(request({ ...validReview, status: 'hidden', source: 'api' }))
  assert.equal(result.status, 201)
  assert.equal(result.body.id, uuid)
  const row = calls.find((c) => c.method === 'insert').args[0]
  assert.equal(row.reviewer_name, 'Test reviewer')
  assert.equal(row.comment, 'Exact words')
  assert.equal(row.status, 'published')
  assert.equal(row.source, 'manual')
  assert.equal(row.google_review_id, null)
  assert.equal(row.reviewer_photo_url, null)
  assert.equal(row.review_created_at, '2024-02-29T12:00:00.000Z')
})

test('POST rejects malformed JSON, invalid types, rating boundaries and long text', async () => {
  const { routes } = setup(collection)
  assert.equal((await routes.POST(request(null, true, true))).status, 400)
  for (const patch of [{ reviewer_name: '' }, { reviewer_name: 'x'.repeat(101) }, { star_rating: 0 }, { star_rating: 6 }, { star_rating: 4.5 }, { star_rating: '5' }, { comment: null }, { comment: 'x'.repeat(4001) }, { review_created_at: '2024-02-30' }]) {
    assert.equal((await routes.POST(request({ ...validReview, ...patch }))).status, 400)
  }
  for (const comment of ['', '   ', undefined]) {
    const { routes, calls } = setup(collection, [{ data: { id: uuid } }])
    assert.equal((await routes.POST(request({ ...validReview, comment }))).status, 201)
    assert.equal(calls.find((c) => c.method === 'insert').args[0].comment, null)
  }
})

test('PATCH validates ids/status, handles missing reviews, and updates matching id', async () => {
  const { routes, calls } = setup(item, [{ data: [{ id: uuid }], error: null }])
  assert.equal((await routes.PATCH(request({ status: 'hidden' }), { params: { id: 'bad' } })).status, 400)
  assert.equal((await routes.PATCH(request({ status: 'invalid' }), context)).status, 400)
  assert.equal((await routes.PATCH(request(null, true, true), context)).status, 400)
  assert.equal((await routes.PATCH(request({ status: 'hidden' }), context)).status, 200)
  assert.ok(calls.some((c) => c.method === 'eq' && c.args[0] === 'id' && c.args[1] === uuid))
  const missing = setup(item)
  assert.equal((await missing.routes.PATCH(request({ status: 'pending' }), context)).status, 404)
})

test('DELETE prevents removal of synced rows, permits manual rows, and handles 404', async () => {
  for (const source of ['api', 'google', 'synced']) {
    const { routes, calls } = setup(item, [{ data: { source } }])
    const result = await routes.DELETE(request(null), context)
    assert.equal(result.status, 409)
    assert.equal(result.body.error, 'Synced reviews can only be hidden, not deleted.')
    assert.equal(calls.some((c) => c.method === 'delete'), false)
  }
  const manual = setup(item, [{ data: { source: 'manual' } }, { error: null }])
  assert.equal((await manual.routes.DELETE(request(null), context)).status, 200)
  assert.ok(manual.calls.some((c) => c.method === 'eq' && c.args[0] === 'source' && c.args[1] === 'manual'))
  const missing = setup(item, [{ data: null }])
  assert.equal((await missing.routes.DELETE(request(null), context)).status, 404)
})

test('PUT validates all fields and converts empty URLs to null', async () => {
  const { routes } = setup(profile)
  assert.equal((await routes.PUT(request(null, true, true))).status, 400)
  for (const patch of [{ reviews_url: 'http://google.com' }, { write_review_url: 'https://google.com.evil.org' }, { average_rating: 0 }, { average_rating: 5.1 }, { average_rating: '4' }, { total_review_count: -1 }, { total_review_count: 1.5 }, { total_review_count: undefined }]) {
    assert.equal((await routes.PUT(request({ ...validProfile, ...patch }))).status, 400)
  }
  const empty = setup(profile, [{ data: { stats_source: 'manual', average_rating: null, total_review_count: null } }, {}])
  assert.equal((await empty.routes.PUT(request({ reviews_url: '', write_review_url: null, average_rating: null, total_review_count: null }))).status, 200)
  assert.equal(empty.calls.find((c) => c.method === 'update').args[0].reviews_url, null)
})

test('PUT updates changed manual statistics, rounds rating and records timestamp', async () => {
  const { routes, calls } = setup(profile, [{ data: { stats_source: 'manual', average_rating: 4, total_review_count: 2 } }, {}])
  assert.equal((await routes.PUT(request(validProfile))).status, 200)
  const update = calls.find((c) => c.method === 'update').args[0]
  assert.equal(update.average_rating, 4.9)
  assert.equal(update.total_review_count, 12)
  assert.equal(update.stats_source, 'manual')
  assert.ok(!Number.isNaN(Date.parse(update.stats_updated_at)))
})

test('PUT preserves API statistics and unchanged manual timestamps', async () => {
  for (const stats of [
    { stats_source: 'api', average_rating: 3, total_review_count: 200 },
    { stats_source: 'manual', average_rating: 4.9, total_review_count: 12 },
  ]) {
    const { routes, calls } = setup(profile, [{ data: stats }, {}])
    assert.equal((await routes.PUT(request(validProfile))).status, 200)
    const update = calls.find((c) => c.method === 'update').args[0]
    assert.equal('stats_updated_at' in update, false)
    assert.equal('stats_source' in update, false)
    if (stats.stats_source === 'api') {
      assert.equal('average_rating' in update, false)
      assert.equal('total_review_count' in update, false)
    }
  }
})

test('database failures return generic messages without leaking error details', async () => {
  for (const [file, method, body] of [[collection, 'POST', validReview], [item, 'PATCH', { status: 'published' }], [item, 'DELETE', null], [profile, 'PUT', validProfile]]) {
    const { routes } = setup(file, [{ data: null, error: { message: 'Private schema detail' } }])
    const result = await routes[method](request(body), context)
    assert.equal(result.status, 500)
    assert.equal(result.body.error, 'Something went wrong. Please try again.')
  }
})
