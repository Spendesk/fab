'use strict'
function __export(m) {
  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p]
}
Object.defineProperty(exports, '__esModule', { value: true })
__export(require('./BuildFailed'))
__export(require('./InvalidConfig'))
__export(require('./InvalidPlugin'))
__export(require('./MissingConfig'))
const DescriptiveError_1 = require('./DescriptiveError')
exports.FabInitError = DescriptiveError_1.createDescriptiveErrorClass('Fab init failed!')
exports.FabDeployError = DescriptiveError_1.createDescriptiveErrorClass(
  'Fab deploy failed!'
)
exports.FabPackageError = DescriptiveError_1.createDescriptiveErrorClass(
  'Fab package failed!'
)
exports.FabServerError = DescriptiveError_1.createDescriptiveErrorClass(
  'Fab serve failed!'
)
//# sourceMappingURL=index.js.map
