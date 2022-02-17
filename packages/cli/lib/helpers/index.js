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
const chalk_1 = __importDefault(require('chalk'))
const cli_ux_1 = __importDefault(require('cli-ux'))
__export(require('./paths'))
__export(require('./modules'))
__export(require('./watcher'))
exports.confirmAndRespond = async (
  log,
  message,
  if_yes = `Ok, proceeding...`,
  if_no = `Ok, exiting`
) => {
  const response = await exports.confirm(message)
  if (response) {
    log(if_yes)
  } else {
    log(if_no)
  }
  return response
}
const HEART_GROUPS_REGEXP = /💛([\s\S]*?)💛|❤️([\s\S]*?)❤️|💚([\s\S]*?)💚|🖤([\s\S]*?)🖤/gm
const HEART_REGEXP = /[💛❤️💚🖤]/gm
function format(str, indent = 0, first_line_indent = 0) {
  return (
    ' '.repeat(first_line_indent) +
    str
      .replace(HEART_GROUPS_REGEXP, (susbstr, y, r, g, b) => {
        if (y) return chalk_1.default.yellow(y)
        if (r) return chalk_1.default.red(r)
        if (g) return chalk_1.default.green(g)
        if (b) return chalk_1.default.grey(b)
        return ''
      })
      .replace(/\.{3}/g, '…')
      .split('\n')
      .map((line) => line.trim())
      .join(`\n${' '.repeat(indent)}`)
  )
}
const WIDTH = 14
exports._log = (full_prefix) => {
  let needs_shortening = full_prefix.length > WIDTH
  const prefix = needs_shortening
    ? `🖤[…${full_prefix.slice(1 - WIDTH)}]🖤`
    : `🖤${`${' '.repeat(WIDTH)}[${full_prefix}]`.slice(-2 - WIDTH)}🖤`
  const indent = WIDTH + 5
  const log = (str) => {
    if (!full_prefix) {
      console.log(format(str))
    } else {
      if (needs_shortening) {
        const first = full_prefix.slice(0, WIDTH - 1)
        console.log(format(`🖤[${first}…]🖤 ${str}`, indent))
        needs_shortening = false
      } else {
        console.log(format(`${prefix} ${str}`, indent))
      }
    }
    return true
  }
  log._last_time = 0
  log.continue = (str) => {
    console.log(format(str, indent, indent))
  }
  log.time = (fn) => {
    if (typeof fn === 'string') return log.time(() => fn)
    const now = +new Date()
    log(fn(`💛${((now - log._last_time) / 1000).toFixed(2)} seconds💛`))
    log._last_time = now
  }
  log.notify = (str) => {
    log(chalk_1.default.yellow(str))
  }
  log.info = (str) => {
    log(chalk_1.default.green(str))
  }
  log.error = (str) => {
    log(chalk_1.default.red(str))
  }
  log.warn = (str) => {
    log(chalk_1.default.red(str))
  }
  log.note = (str) => {
    log(`💚NOTE:💚 ${str}`)
  }
  log.tick = (str, indent = 0) => {
    log(`💚${' '.repeat(indent)}✔💚 ${str}`)
  }
  log.cross = (str, indent = 0) => {
    log(`${' '.repeat(indent)}❌ ${str}`)
  }
  log.announce = (str) => {
    log(`💎 💚${str}💚 💎`)
  }
  log.confirmAndRespond = (message, if_yes, if_no) =>
    exports.confirmAndRespond(log, `\n${message}`, if_yes, if_no)
  log.strip = (str) => str.replace(HEART_REGEXP, '')
  return log
}
exports.log = exports._log('')
exports.confirm = (message) => cli_ux_1.default.confirm(format(message))
exports.prompt = (message, opts) => cli_ux_1.default.prompt(format(message), opts)
//# sourceMappingURL=index.js.map
