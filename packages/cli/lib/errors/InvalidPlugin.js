'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const helpers_1 = require('../helpers')
class InvalidPluginError extends Error {
  constructor(plugin_name, message) {
    super(`The plugin at '${plugin_name}' has errors!`)
    helpers_1.log.error(`ERROR: Problem with plugin '${plugin_name}'.\n\n${message}`)
  }
}
exports.InvalidPluginError = InvalidPluginError
//# sourceMappingURL=InvalidPlugin.js.map
