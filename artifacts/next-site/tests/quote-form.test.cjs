const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function load(file, imports = {}, globals = {}) {
  const exports = {}
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText
  vm.runInNewContext(code, {
    exports, Date, console,
    require: name => {
      if (!(name in imports)) throw new Error(`Unexpected import: ${name}`)
      return imports[name]
    },
    ...globals,
  })
  return exports
}

const services = load('lib/service-cards.ts')
const quote = load('lib/quote-form.ts', { '@/lib/service-cards': services })
const fields = {
  ...quote.EMPTY_QUOTE,
  name: ' Test Mover ',
  email: ' test@example.com ',
  phone: ' (470) 555-0100 ',
  move_type: 'moving',
  origin_address: ' 123 Example Street, Athens, GA ',
  destination_address: ' 456 Example Lane, Athens, GA ',
  notes: ' Three bedrooms, stairs, and a fragile glass table. ',
  move_date: '2099-01-08',
}

test('each completed step validates independently', () => {
  for (const step of [1, 2, 3]) {
    assert.equal(Object.keys(quote.validateQuoteStep(step, fields)).length, 0)
  }
  assert.deepEqual(Object.keys(quote.validateQuoteStep(1, quote.EMPTY_QUOTE)), ['name', 'email', 'phone'])
  assert.deepEqual(Object.keys(quote.validateQuoteStep(2, quote.EMPTY_QUOTE)), ['move_type', 'origin_address', 'destination_address', 'notes'])
  assert.deepEqual(Object.keys(quote.validateQuoteStep(3, quote.EMPTY_QUOTE)), ['move_date'])
})

test('all five service choices resolve to their database label, and unknown choices are rejected', () => {
  const choices = [
    ['moving', 'Moving'], ['delivery', 'Delivery'], ['junk-removal', 'Junk Removal'],
    ['moving-and-packing', 'Moving and Packing'], ['packing', 'Packing'],
  ]
  assert.equal(services.SERVICE_CARDS.length, choices.length)
  for (const [slug, name] of choices) {
    assert.equal(services.findService(slug)?.name, name)
    assert.equal(quote.validateQuoteStep(2, { ...fields, move_type: slug }).move_type, undefined)
    assert.equal(quote.buildQuotePayload({ ...fields, move_type: slug }).move_size, name)
  }
  assert.equal(services.findService(['moving', 'delivery']), undefined)
  for (const move_type of ['', 'unknown']) {
    assert.ok(quote.validateQuoteStep(2, { ...fields, move_type }).move_type)
  }
})

test('contact validation rejects invalid email, phone, and oversized names', () => {
  for (const email of ['bad', 'person@host', 'person @example.com', 'a@@example.com']) {
    assert.ok(quote.validateQuoteStep(1, { ...fields, email }).email)
  }
  for (const phone of ['abc', '123', 'x'.repeat(51)]) {
    assert.ok(quote.validateQuoteStep(1, { ...fields, phone }).phone)
  }
  assert.ok(quote.validateQuoteStep(1, { ...fields, name: 'x'.repeat(201) }).name)
})

test('move information requires both addresses and useful bounded notes', () => {
  for (const key of ['origin_address', 'destination_address', 'notes']) {
    assert.ok(quote.validateQuoteStep(2, { ...fields, [key]: '   ' })[key])
  }
  assert.ok(quote.validateQuoteStep(2, { ...fields, notes: 'x'.repeat(10001) }).notes)
  assert.ok(quote.validateQuoteStep(2, { ...fields, origin_address: 'x'.repeat(1001) }).origin_address)
})

test('calendar values preserve the local date instead of converting to UTC', () => {
  assert.equal(quote.getTodayISO(new Date(2026, 10, 17, 23, 59)), '2026-11-17')
  assert.equal(quote.getTodayISO(new Date(2026, 0, 2, 0, 1)), '2026-01-02')
})

test('calendar accepts today, future dates and weekends, but rejects impossible or past dates', () => {
  for (const day of ['2026-11-17', '2026-11-21', '2026-11-22', '2027-01-01']) {
    assert.equal(quote.isSelectableMoveDate(day, '2026-11-17'), true, day)
  }
  for (const day of ['', '2026-11-16', '2026-02-30', '2026-13-01', '2026-1-1', 'not-a-date']) {
    assert.equal(quote.isSelectableMoveDate(day, '2026-11-17'), false, day)
  }
  assert.equal(quote.isSelectableMoveDate('2028-02-29', '2026-11-17'), true)
  assert.equal(quote.isSelectableMoveDate('2027-02-29', '2026-11-17'), false)
  assert.ok(quote.validateQuoteStep(3, { ...fields, move_date: '2000-01-01' }).move_date)
})

test('submission payload maps every form value to the existing quote API contract', () => {
  const payload = quote.buildQuotePayload({ ...fields, _hp: 'honeypot-value' })
  assert.equal(payload.name, 'Test Mover')
  assert.equal(payload.email, 'test@example.com')
  assert.equal(payload.phone, '(470) 555-0100')
  assert.equal(payload.origin_address, '123 Example Street, Athens, GA')
  assert.equal(payload.destination_address, '456 Example Lane, Athens, GA')
  assert.equal(payload.notes, 'Three bedrooms, stairs, and a fragile glass table.')
  assert.equal(payload.move_date, '2099-01-08')
  assert.equal(payload.move_size, 'Moving')
  assert.equal(payload._hp, 'honeypot-value')
  assert.equal(fields.name, ' Test Mover ', 'building a payload must not change editable state')
})

function loadRoute() {
  const inserted = []
  const notifications = []
  class Response {
    constructor(body, options = {}) { this.body = body; this.status = options.status || 200 }
    static json(body, options) { return new Response(body, options) }
  }
  const route = load('app/api/quote/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/supabase/admin': { createAdminClient: () => ({
      from: table => ({ insert: async row => { inserted.push({ table, row }); return { error: null } } }),
    }) },
    '@/lib/env': { getServerEnv: () => 'test-only-placeholder' },
  }, {
    URLSearchParams,
    btoa: value => Buffer.from(value).toString('base64'),
    fetch: async (url, options) => {
      notifications.push({ url, options })
      return { ok: true, json: async () => ({}) }
    },
  })
  return { ...route, inserted, notifications }
}

test('existing backend stores the new flow payload and retains all four owner alerts without real sends', async () => {
  const route = loadRoute()
  const payload = quote.buildQuotePayload(fields)
  const response = await route.POST({ json: async () => payload, cookies: { get: () => undefined } })
  assert.equal(response.status, 200)
  assert.equal(route.inserted.length, 1)
  assert.equal(route.inserted[0].table, 'quotes')
  for (const key of ['name', 'email', 'phone', 'origin_address', 'destination_address', 'notes', 'move_date', 'move_size']) {
    assert.equal(route.inserted[0].row[key], payload[key], key)
  }
  assert.equal(route.notifications.length, 4)
  assert.equal(route.notifications.filter(item => item.url.includes('resend.com')).length, 2)
  assert.equal(route.notifications.filter(item => item.url.includes('twilio.com')).length, 2)
})

test('honeypot submissions do not create quotes or send owner notifications', async () => {
  const route = loadRoute()
  const response = await route.POST({
    json: async () => quote.buildQuotePayload({ ...fields, _hp: 'bot' }),
    cookies: { get: () => undefined },
  })
  assert.equal(response.status, 200)
  assert.equal(route.inserted.length, 0)
  assert.equal(route.notifications.length, 0)
})
