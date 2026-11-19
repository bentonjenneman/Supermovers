const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')
const { webcrypto } = require('node:crypto')

function load(file, mocks = {}, globals = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, { exports, require: name => {
    if (!(name in mocks)) throw new Error(`Unexpected import: ${name}`)
    return mocks[name]
  }, URL, TextEncoder, crypto: webcrypto, process, console, ...globals })
  return exports
}
const blog = load('lib/blog.ts')
const article = { ...blog.EMPTY_POST, title: 'Moving tips', slug: 'moving-tips', excerpt: 'A useful preview', content: 'Real article text', image_url: '/photos/Supermovers_Moving.JPEG', status: 'published' }

test('validates text articles and keeps their exact text', () => {
  const result = blog.validatePost(article)
  assert.equal(result.data.content, article.content)
  assert.equal(result.data.status, 'published')
})
test('drafts can be incomplete, published text requires a cover and body', () => {
  assert.ok(blog.validatePost({ ...blog.EMPTY_POST, title: 'Draft', slug: 'draft' }).data)
  for (const field of ['title', 'slug', 'excerpt', 'content', 'image_url']) {
    assert.ok(blog.validatePost({ ...article, [field]: '' }).error, field)
  }
})
test('rejects malformed, oversized, or unsafe post fields', () => {
  for (const value of [
    null, {}, { ...article, title: 'x'.repeat(181) }, { ...article, content: 'x'.repeat(50001) },
    { ...article, slug: '../admin' }, { ...article, kind: 'html' }, { ...article, status: 'hidden' },
    { ...article, image_url: 'javascript:alert(1)' }, { ...article, image_url: '//evil.test/a.png' },
  ]) assert.ok(blog.validatePost(value).error)
})
test('YouTube allowlist accepts supported video formats only', () => {
  for (const url of ['https://youtu.be/abcdefghijk', 'https://www.youtube.com/watch?v=abcdefghijk&t=30', 'https://youtube.com/shorts/abcdefghijk']) {
    assert.equal(blog.youtubeId(url), 'abcdefghijk')
  }
  for (const url of ['https://youtube.com.evil.test/watch?v=abcdefghijk', 'javascript:alert(1)', 'https://youtube.com/playlist?list=abcdefghijk', 'https://user:pass@youtube.com/watch?v=abcdefghijk', 'https://youtu.be/tooshort', 'http://youtube.com/watch?v=abcdefghijk']) {
    assert.equal(blog.youtubeId(url), null)
  }
})
test('video posts need a real YouTube link and get a thumbnail without an upload', () => {
  const video = { ...article, kind: 'video', content: '', image_url: '', youtube_url: 'https://youtu.be/abcdefghijk' }
  assert.ok(blog.validatePost(video).data)
  assert.equal(blog.postImage(video), 'https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg')
  assert.ok(blog.validatePost({ ...video, youtube_url: '' }).error)
  assert.equal(blog.postImage({ ...video, image_url: '/custom.jpg' }), '/custom.jpg')
})
test('comments require bounded name and body', () => {
  assert.equal(blog.validateComment({ name: '  Visitor ', body: ' Nice article! ' }).data.body, 'Nice article!')
  for (const input of [{ name: '', body: 'hi' }, { name: 'Joe', body: '' }, { name: 'x'.repeat(81), body: 'hi' }, { name: 'Joe', body: 'x'.repeat(3001) }, null]) {
    assert.ok(blog.validateComment(input).error)
  }
})

class Response {
  constructor(body, init = {}) { this.body = body; this.status = init.status || 200; this.headers = new Map(); this.cookies = { set: (...args) => this.cookie = args } }
  static json(body, init) { return new Response(body, init) }
}
test('every admin Blog handler checks authentication before touching data', async () => {
  const files = [
    ['app/api/admin/blog/route.ts', ['GET', 'POST']],
    ['app/api/admin/blog/[id]/route.ts', ['GET', 'PUT', 'DELETE']],
    ['app/api/admin/blog/images/route.ts', ['POST']],
    ['app/api/admin/blog/comments/route.ts', ['GET']],
    ['app/api/admin/blog/comments/[id]/route.ts', ['PATCH', 'DELETE']],
  ]
  for (const [file, methods] of files) {
    const api = load(file, {
      'next/server': { NextResponse: Response },
      '@/lib/admin/require-admin': { requireAdmin: () => Response.json({ error: 'Unauthorized' }, { status: 401 }) },
      '@/lib/supabase/admin': { createAdminClient: () => { throw new Error('Must never access DB') } },
      '@/lib/blog': blog, '@/lib/blog-server': { POST_FIELDS: 'id', createBlogClient: () => { throw new Error('Must never access DB') } },
      '@/lib/blog-http': { sameOrigin: () => null },
    })
    for (const method of methods) assert.equal((await api[method]({}, { params: { id: 'anything' } })).status, 401, `${file} ${method}`)
  }
})
test('signed visitor cookie persists identity and rejects tampering', async () => {
  const http = load('lib/blog-http.ts', {
    'next/server': { NextResponse: Response }, '@/lib/env': { getServerEnv: () => 'test-signing-secret' },
    '@/lib/blog-server': { blogError: () => 'error' }, '@/lib/blog': blog,
  })
  const first = await http.visitor({ cookies: { get: () => undefined } })
  assert.ok(blog.validId(first.id))
  const second = await http.visitor({ cookies: { get: () => ({ value: first.cookie }) } })
  assert.equal(second.id, first.id)
  assert.equal(second.cookie, null)
  const forged = await http.visitor({ cookies: { get: () => ({ value: first.cookie + 'bad' }) } })
  assert.notEqual(forged.id, first.id)
})
test('cross-site writes are rejected', () => {
  const http = load('lib/blog-http.ts', {
    'next/server': { NextResponse: Response }, '@/lib/env': {}, '@/lib/blog-server': {}, '@/lib/blog': blog,
  })
  const req = (origin, site = 'same-origin') => ({ nextUrl: { host: 'example.com' }, headers: new Map([['origin', origin], ['host', 'example.com'], ['sec-fetch-site', site]]) })
  assert.equal(http.sameOrigin(req('https://example.com')), null)
  assert.equal(http.sameOrigin(req('https://evil.test')).status, 403)
  assert.equal(http.sameOrigin(req('https://example.com', 'cross-site')).status, 403)
})

test('live Supabase Blog clients explicitly disable the server fetch cache', async () => {
  let options, forwarded
  const admin = load('lib/supabase/admin.ts', {
    '@supabase/supabase-js': { createClient: (_url, _key, opts) => { options = opts; return {} } },
    '@/lib/env': { getServerEnv: key => key.includes('URL') ? 'https://supabase.example.test' : 'test-key' },
  }, { fetch: async (input, init) => { forwarded = { input, init }; return {} } })
  admin.createAdminClient({ noStore: true })
  await options.global.fetch('https://supabase.example.test/rest/v1/blog_comments?status=eq.approved', { cache: 'force-cache', method: 'GET' })
  assert.equal(forwarded.init.cache, 'no-store')
  assert.equal(forwarded.init.method, 'GET')
  let noStoreCalled = false, received
  const server = load('lib/blog-server.ts', {
    'next/cache': { unstable_noStore: () => { noStoreCalled = true } },
    '@/lib/supabase/admin': { createAdminClient: opts => { received = opts; return {} } },
    '@/lib/blog': blog,
  })
  server.createBlogClient()
  assert.equal(noStoreCalled, true)
  assert.equal(received.noStore, true)
})
