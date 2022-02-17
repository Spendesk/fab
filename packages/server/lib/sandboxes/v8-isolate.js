'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const cross_fetch_1 = require('cross-fetch')
exports.default = async (src) => {
  const ivm = require('isolated-vm')
  const isolate = new ivm.Isolate({ memoryLimit: 128 })
  const context = await isolate.createContext()
  console.log({ context })
  const g = context.global
  await g.set('global', g.derefInto())
  await context.evalClosure(
    `
    global.console = {
      log(...args) {
        $0.getSync('log').applyIgnored($0, args, { arguments: { copy: true } });
      }
    }
    `,
    [console],
    // @ts-ignore
    { arguments: { reference: true } }
  )
  const flyV8 = await fs_extra_1.default.readFile(
    require.resolve('@fly/v8env/dist/v8env.js'),
    'utf8'
  )
  // console.log(flyV8)
  const script = await isolate.compileScript(`
    ${flyV8};
    iife = ${src};
    function FAB_render(...args) {
      console.log(JSON.stringify(Object.keys(iife)))
      return bridge.wrapValue(iife.render(...args))
    }
    function FAB_getMetadata(...args) {
      console.log(JSON.stringify(Object.keys(iife)))
      return iife.metadata
    }
  `)
  console.log({ script })
  const retval = await script.run(context)
  console.log({ retval })
  const bootstrapBridge = await g.get('bootstrapBridge')
  await bootstrapBridge.apply(null, [
    ivm,
    new ivm.Reference((name, ...args) => {
      console.log(`[BRIDGE DISPATCH] ${name}`)
      console.log(...args)
    }),
  ])
  const bootstrap = await g.get('bootstrap')
  await bootstrap.apply()
  await context.eval(`console.log(JSON.stringify(Object.keys(global)))`)
  await context.eval(`console.log(JSON.stringify(Object.keys(global.fly)))`)
  await context.eval(`console.log(JSON.stringify(Object.keys(global.fly.http)))`)
  await context.eval(`console.log(JSON.stringify(Object.keys(iife)))`)
  const iifeRef = await g.get('iife')
  console.log({ iifeRef })
  const renderRef = await g.get('FAB_render')
  const metadataRef = await g.get('FAB_getMetadata')
  const metadata = metadataRef()
  return {
    async render(request, settings) {
      console.log('RENDERING')
      const response = new cross_fetch_1.Response(`V8 Runtime not implemented`, {
        status: 500,
        headers: {},
      })
      // @ts-ignore
      return response
    },
    metadata,
    initialize() {
      // TODO: wire this up
    },
  }
}
//# sourceMappingURL=v8-isolate.js.map
