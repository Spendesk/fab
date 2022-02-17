'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const helpers_1 = require('../helpers')
exports.createDescriptiveErrorClass = (error_name) => {
  return class DescriptiveError extends Error {
    constructor(message) {
      super(helpers_1.log.strip(`${error_name}\n${message}`))
      helpers_1.log(`❤️${error_name}❤️\n\n${message}`)
    }
  }
}
//# sourceMappingURL=DescriptiveError.js.map
