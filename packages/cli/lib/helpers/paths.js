'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const path_1 = __importDefault(require('path'))
exports.isRelative = (plugin_name) => plugin_name.match(/^\.\.?\//)
exports.relativeToConfig = (config_path, relative_path, might_be_npm_package = true) =>
  might_be_npm_package && !exports.isRelative(relative_path)
    ? relative_path
    : path_1.default.resolve(path_1.default.dirname(config_path), relative_path)
//# sourceMappingURL=paths.js.map
