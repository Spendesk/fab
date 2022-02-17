'use strict'
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result['default'] = mod
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
const path = __importStar(require('path'))
const core_1 = require('@fab/core')
const helpers_1 = require('../helpers')
class MissingConfig extends Error {
  constructor(file_path) {
    super(`Missing config file at '${file_path}'`)
    // This may need to change, this naively assumes that creating this object
    // means that things have gone pear shaped (fairly reasonable), and that
    // the right way to log out is just by calling global console.log (maybe less so)
    if (file_path === core_1.DEFAULT_CONFIG_FILENAME) {
      helpers_1.log.error(`
ERROR: No config file found.

All FAB tooling assumes that you have a valid config file (by default, 'fab.config.json5' in the current working directory.
Either use the --config argument to point to a different file or run the following command to generate one:

  fab init
`)
    } else {
      helpers_1.log.error(`
Config file '${file_path}' not found.
Looked for file at '${path.resolve(file_path)}' but it didn't exist.
Maybe you need to run 'fab init', or you're running in the wrong directory?
`)
    }
  }
}
exports.MissingConfig = MissingConfig
//# sourceMappingURL=MissingConfig.js.map
