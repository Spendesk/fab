'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const path_1 = __importDefault(require('path'))
const util_1 = __importDefault(require('util'))
// @ts-ignore
const deterministic_zip_1 = __importDefault(require('deterministic-zip'))
const cli_1 = require('@fab/cli')
const pretty_bytes_1 = __importDefault(require('pretty-bytes'))
const zip = util_1.default.promisify(deterministic_zip_1.default)
const log = cli_1._log(`Generator`)
class Generator {
  static async generate(proto_fab) {
    // After build, there should only be files in the expected places (server.js, _assets)
    const invalid_reason = proto_fab.errorsPreventingCompilation()
    if (invalid_reason) {
      throw new cli_1.BuildFailedError(`FAB is not ready for compilation.
        ${invalid_reason}
        You might need to add @fab/plugin-rewire-assets to your 'build' config. See https://fab.dev/packages/rewire-assets for more information about what this module is and why it's needed.
      `)
    }
    log.time(`Writing all files to .fab/build`)
    await fs_extra_1.default.emptyDir('.fab/build')
    for (const [filename, contents] of proto_fab.files.entries()) {
      const path = `.fab/build${filename}`
      log.continue(`🖤  ${filename} (${pretty_bytes_1.default(contents.length)})🖤`)
      await fs_extra_1.default.ensureFile(path)
      await fs_extra_1.default.writeFile(path, contents)
    }
    log.time((d) => `Done in ${d}.`)
    log.time(`Zipping it up into a FAB:`)
    const zipfile = path_1.default.resolve('fab.zip')
    const build_dir = path_1.default.resolve('.fab/build')
    const options = {
      includes: ['./server.js', './_assets/**'],
      cwd: build_dir,
    }
    await zip(build_dir, zipfile, options)
    const stats2 = await fs_extra_1.default.stat(zipfile)
    log.time(
      (d) =>
        `Created 💛${path_1.default.relative(
          process.cwd(),
          zipfile
        )}💛 🖤(${pretty_bytes_1.default(stats2.size)})🖤 in ${d}`
    )
  }
}
exports.Generator = Generator
//# sourceMappingURL=Generator.js.map
