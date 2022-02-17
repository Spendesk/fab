'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const cli_1 = require('@fab/cli')
const rollup_1 = require('./rollup')
const log = cli_1._log(`Compiler`)
class Compiler {
  static async compile(config, proto_fab, plugins, minify = false) {
    log.time(() => `Compiling your 💛server.js💛:`)
    const warnings = []
    const {
      output: [output, ...chunks],
    } = await rollup_1.rollupCompile(require.resolve('@fab/actions/esm/runtime'), {
      minify,
      output: { format: 'umd', exports: 'named', name: '__fab' },
      hypotheticals: {
        ...proto_fab.hypotheticals,
        'fab-runtime-imports': generateRuntimeImports(plugins),
        'fab-metadata': generateFabMetadataJs(proto_fab),
        'production-settings': generateProductionSettings(config),
      },
      additional: {
        onwarn(warning, handler) {
          if (warning.code === 'UNRESOLVED_IMPORT') {
            warnings.push(
              `Could not find module '${warning.source}' during build of '${warning.importer}'`
            )
          } else {
            handler(warning)
          }
        },
      },
    })
    if (warnings.length > 0) {
      throw new cli_1.BuildFailedError(
        `Errors encountered during Rollup build:\n\n  - ${warnings.join('\n  - ')}\n`
      )
    }
    // console.log(output)
    if (chunks.length > 0) {
      log.error(`WARNING: Didn't expect there to be more than one chunk created! Got:`)
      console.log(chunks)
    }
    proto_fab.files.set('/server.js', Buffer.from(output.code))
    log.time((d) => `Done in ${d}.`)
  }
}
exports.Compiler = Compiler
function generateRuntimeImports(plugins) {
  let plugin_index = 0
  const plugin_aliases = plugins.map(({ runtime, plugin_args }, i) => ({
    alias: `runtime_${i + 1}`,
    import_path: runtime,
    args: plugin_args,
  }))
  const import_statements = plugin_aliases
    .map(({ alias, import_path }) => `import ${alias} from '${import_path}'`)
    .join('\n')
  return `
    ${import_statements};

    export const runtimes = [
      ${plugin_aliases
        .map(({ alias, args }) => {
          return `{ plugin: ${alias}, args: ${JSON.stringify(args)} }`
        })
        .join(',\n')}
    ];
  `
}
function generateFabMetadataJs(proto_fab) {
  return `
    export const fab_metadata = ${proto_fab.toJSON()};
  `
}
function generateProductionSettings(config) {
  var _a
  return `
    export const production_settings = ${JSON.stringify(
      ((_a = config.settings) === null || _a === void 0 ? void 0 : _a.production) || {}
    )}
  `
}
//# sourceMappingURL=Compiler.js.map
