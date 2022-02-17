'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const rollup_1 = require('rollup')
const plugin_node_resolve_1 = __importDefault(require('@rollup/plugin-node-resolve'))
const plugin_commonjs_1 = __importDefault(require('@rollup/plugin-commonjs'))
const plugin_json_1 = __importDefault(require('@rollup/plugin-json'))
const plugin_typescript_1 = __importDefault(require('@rollup/plugin-typescript'))
const rollup_plugin_terser_1 = require('rollup-plugin-terser')
// @ts-ignore
const plugin_alias_1 = __importDefault(require('@rollup/plugin-alias'))
// @ts-ignore
const rollup_plugin_hypothetical_1 = __importDefault(
  require('rollup-plugin-hypothetical')
)
const cli_1 = require('@fab/cli')
const log = cli_1._log(`rollup`)
async function rollupCompile(input, options = {}) {
  const { output = {}, hypotheticals = {}, minify = false, additional = {} } = options
  const empty = require.resolve(__dirname + '/empty')
  const entries = {
    path: require.resolve('path-browserify'),
    'node-fetch': empty,
  }
  try {
    const bundle = await rollup_1.rollup({
      input,
      plugins: [
        rollup_plugin_hypothetical_1.default({
          files: hypotheticals,
          allowFallthrough: true,
        }),
        plugin_alias_1.default({ entries }),
        plugin_node_resolve_1.default({
          preferBuiltins: true,
        }),
        plugin_commonjs_1.default(),
        plugin_typescript_1.default({
          tsconfig: false,
          include: ['/**/*.ts', '/**/*.tsx'],
        }),
        plugin_json_1.default(),
        ...[minify ? rollup_plugin_terser_1.terser() : []],
      ],
      ...additional,
    })
    return bundle.generate(output)
  } catch (e) {
    if (e.code) {
      log.error(`Error: ${e.code}`)
      if (e.loc) {
        log.error(`Failed at:`)
        console.log(e.loc)
      }
      if (e.frame) {
        log.error(`At frame:`)
        console.log(e.frame)
      }
      log.error(`Stack trace follows:`)
    }
    throw e
  }
}
exports.rollupCompile = rollupCompile
//# sourceMappingURL=rollup.js.map
