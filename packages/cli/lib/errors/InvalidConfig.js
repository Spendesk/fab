'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const helpers_1 = require('../helpers')
class InvalidConfigError extends Error {
  constructor(explanation, e) {
    super(`Config file contains errors!`)
    if (e) console.log(e)
    helpers_1.log(`❤️ERROR: Problem with config file.❤️\n\n${explanation}\n`)
  }
}
exports.InvalidConfigError = InvalidConfigError
//# sourceMappingURL=InvalidConfig.js.map
