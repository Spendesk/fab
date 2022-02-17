'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const cli_1 = require('@fab/cli')
const execa_1 = __importDefault(require('execa'))
const path_1 = __importDefault(require('path'))
const tmp_promise_1 = __importDefault(require('tmp-promise'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const log = cli_1._log('Typecheck')
class Typecheck {
  constructor(cwd, plugins) {
    log(`Typechecking ${plugins.length} plugins (in background)...`)
    this.promise = (async () => {
      const dir = await tmp_promise_1.default.dir()
      const tsconfig_path = path_1.default.join(dir.path, 'fab-tsconfig.json')
      const tsconfig = {
        compilerOptions: {
          target: 'es2020',
          module: 'commonjs',
          lib: ['es2020', 'dom'],
          declaration: false,
          sourceMap: false,
          strict: true,
          noImplicitReturns: false,
          noFallthroughCasesInSwitch: true,
          moduleResolution: 'node',
          baseUrl: './',
          paths: {},
          esModuleInterop: true,
          forceConsistentCasingInFileNames: true,
        },
        include: plugins,
        exclude: [],
      }
      await fs_extra_1.default.writeFile(tsconfig_path, JSON.stringify(tsconfig, null, 2))
      return execa_1.default('tsc', ['--pretty', '--noEmit', '-p', tsconfig_path], {
        cwd,
      })
    })()
  }
  static startTypecheck(config_path, plugins, skip_typecheck) {
    if (skip_typecheck) {
      log(`🖤Skipping.🖤`)
      return Typecheck.Noop
    }
    const ts_plugins = plugins.map((p) => p.runtime).filter((r) => r.match(/\.tsx?$/))
    if (ts_plugins.length === 0) {
      log(`🖤No Typescript plugins detected. Skipping.🖤`)
      return Typecheck.Noop
    }
    return new Typecheck(path_1.default.dirname(config_path), ts_plugins)
  }
  async waitForResults() {
    try {
      log(`Waiting for results. Pass 💛--skip-typecheck💛 to skip this step in future.`)
      await this.promise
      log.tick(`Typecheck passed.`)
    } catch (e) {
      if (process.env.CI) {
        throw e
      } else {
        log.cross(`Typecheck failed:`)
        console.log(e.stdout)
        log.note(
          `Treating errors as 💛warnings💛.\nSet environment variable 💛CI=true💛 to fail the build on type errors.`
        )
      }
    }
  }
}
exports.Typecheck = Typecheck
Typecheck.Noop = {
  promise: undefined,
  async waitForResults() {},
}
//# sourceMappingURL=Typecheck.js.map
