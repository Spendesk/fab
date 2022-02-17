'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const Packager_1 = __importDefault(require('./Packager'))
const Deployer_1 = __importDefault(require('./Deployer'))
const Builder_1 = __importDefault(require('./Builder'))
const Actions = {
  Packager: Packager_1.default,
  Deployer: Deployer_1.default,
  Builder: Builder_1.default,
}
exports.default = Actions
//# sourceMappingURL=index.js.map
