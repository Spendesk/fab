'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const chokidar_1 = __importDefault(require('chokidar'))
exports.watcher = async (dirs, fn, options) => {
  if (dirs && dirs.length > 0) {
    let building = false
    const run_fn_once_at_a_time = async (message) => {
      if (building) return
      building = true
      console.clear()
      console.log(message)
      await fn()
      building = false
    }
    // noinspection ES6MissingAwait
    run_fn_once_at_a_time(`Watching paths: ${dirs.join(' ')}`)
    chokidar_1.default.watch(dirs).on('ready', () => {
      chokidar_1.default.watch(dirs, options).on('all', (event, path) => {
        run_fn_once_at_a_time(`${path} changed`)
      })
    })
  } else {
    await fn()
  }
}
//# sourceMappingURL=watcher.js.map
