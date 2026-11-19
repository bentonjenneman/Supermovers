const test = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const ts = require('typescript')

function mount({ reduced = false, supported = true } = {}) {
  const states = []
  const effects = []
  const listeners = new Map()
  const observers = []
  const element = {}
  const motion = {
    matches: reduced,
    addEventListener: (name, listener) => listeners.set(name, listener),
    removeEventListener: name => listeners.delete(name),
  }
  class Observer {
    constructor(callback, options) {
      this.callback = callback
      this.options = options
      this.disconnected = false
      observers.push(this)
    }
    observe(target) { assert.equal(target, element) }
    disconnect() { this.disconnected = true }
  }
  const exports = {}
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '../components/home/ReviewReveal.tsx'), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const mocks = {
    react: {
      useRef: () => ({ current: element }),
      useState: initial => { states.push(initial); return [initial, value => states.push(value)] },
      useEffect: effect => effects.push(effect),
    },
    'react/jsx-runtime': {
      jsx: (type, props) => ({ type, props }),
    },
  }
  vm.runInNewContext(source, {
    exports,
    require: name => { assert.ok(name in mocks, name); return mocks[name] },
    window: { matchMedia: () => motion, ...(supported ? { IntersectionObserver: Observer } : {}) },
    IntersectionObserver: Observer,
  })
  const tree = exports.default({ children: 'Actual review', className: 'stagger', testId: 'review' })
  const cleanup = effects[0]()
  return { states, observers, motion, listeners, cleanup, tree }
}

test('reviews fade in, fade out, and reappear when crossing the viewport repeatedly', () => {
  const { states, observers, cleanup, listeners, tree } = mount()
  assert.equal(tree.type, 'li')
  assert.equal(tree.props.children.props['data-review-visible'], true)
  const observer = observers[0]
  for (const [isIntersecting, intersectionRatio] of [[false, 0], [true, 0.5], [true, 0.05], [true, 0.8]]) {
    observer.callback([{ isIntersecting, intersectionRatio }])
  }
  assert.deepEqual(states, [true, false, true, false, true])
  cleanup()
  assert.equal(observer.disconnected, true)
  assert.equal(listeners.size, 0)
})

test('reduced-motion and unsupported browsers keep reviews readable without animation', () => {
  for (const settings of [{ reduced: true }, { supported: false }]) {
    const mounted = mount(settings)
    assert.equal(mounted.observers.length, 0)
    assert.ok(mounted.states.every(Boolean))
    mounted.cleanup()
  }
})

test('switching reduced motion on disconnects the observer and reveals all text', () => {
  const { observers, states, motion, listeners, cleanup } = mount()
  observers[0].callback([{ isIntersecting: false, intersectionRatio: 0 }])
  motion.matches = true
  listeners.get('change')()
  assert.equal(observers[0].disconnected, true)
  assert.equal(states.at(-1), true)
  cleanup()
})
