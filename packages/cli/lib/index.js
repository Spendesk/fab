'use strict'
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p]
}
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var command_1 = require('@oclif/command')
exports.run = command_1.run
__export(require('./errors'))
__export(require('./helpers'))
const JSON5Config_1 = __importDefault(require('./helpers/JSON5Config'))
exports.JSON5Config = JSON5Config_1.default
//# sourceMappingURL=index.js.map
