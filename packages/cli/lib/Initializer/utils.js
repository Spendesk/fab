'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const helpers_1 = require('../helpers')
const isBuildScript = (script_name) => script_name.match(/^build/)
exports.mergeScriptsAfterBuild = (existing_scripts, framework_scripts) => {
  const merged_scripts = {}
  const script_names = Object.keys(existing_scripts)
  let merged = false
  script_names.forEach((script_name, i) => {
    if (
      !merged &&
      i !== 0 &&
      isBuildScript(script_names[i - 1]) &&
      !isBuildScript(script_name)
    ) {
      Object.assign(merged_scripts, framework_scripts)
      merged = true
    }
    merged_scripts[script_name] = existing_scripts[script_name]
  })
  if (!merged) Object.assign(merged_scripts, framework_scripts)
  return merged_scripts
}
exports.log = helpers_1._log('Initializer')
//# sourceMappingURL=utils.js.map
