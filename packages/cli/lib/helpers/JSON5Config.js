'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const core_1 = require('@fab/core')
const jju_1 = __importDefault(require('jju'))
const regex_parser_1 = __importDefault(require('regex-parser'))
const errors_1 = require('../errors')
const prettier_1 = __importDefault(require('prettier'))
class JSON5Config {
  constructor(str_contents, data) {
    // todo: can we generate a validator from the TS definition
    if (!data.plugins) {
      throw new errors_1.InvalidConfigError(
        `The FAB config file is missing a 'plugins' property.`
      )
    }
    for (const [plugin, args] of Object.entries(data.plugins)) {
      for (const [k, v] of Object.entries(args)) {
        if (typeof v === 'string' && v.match(core_1.REGEXP_VALUE_PATTERN)) {
          args[k] = regex_parser_1.default(v)
        }
      }
    }
    this.str_contents = str_contents
    this.data = data
  }
  static async readFrom(file_path) {
    if (!(await fs_extra_1.default.pathExists(file_path))) {
      throw new errors_1.MissingConfig(file_path)
    }
    const str_contents = await core_1.a_sume(
      () => fs_extra_1.default.readFile(file_path, 'utf8'),
      () => new errors_1.InvalidConfigError(`Could not read file at '${file_path}'`)
    )
    const data = core_1.s_sume(
      () => jju_1.default.parse(str_contents),
      (e) =>
        new errors_1.InvalidConfigError(
          `Could not parse file at '${file_path}'. Check that it is valid JSON5.\n${e}`
        )
    )
    return new JSON5Config(str_contents, data)
  }
  static generate(data) {
    return new JSON5Config(data, jju_1.default.parse(data))
  }
  async write(file_path) {
    await fs_extra_1.default.writeFile(
      file_path,
      prettier_1.default.format(jju_1.default.update(this.str_contents, this.data), {
        parser: 'json5',
        singleQuote: true,
      })
    )
  }
}
exports.default = JSON5Config
//# sourceMappingURL=JSON5Config.js.map
