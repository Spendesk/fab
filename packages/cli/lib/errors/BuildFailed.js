'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const helpers_1 = require('../helpers')
class BuildFailedError extends Error {
  constructor(message) {
    super(`Build failed!`)
    helpers_1.log(`❤️Build failed!❤️\n\n${message}`)
  }
}
exports.BuildFailedError = BuildFailedError
//# sourceMappingURL=BuildFailed.js.map
