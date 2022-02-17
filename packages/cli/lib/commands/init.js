'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const command_1 = require('@oclif/command')
const core_1 = require('@fab/core')
const Initializer_1 = __importDefault(require('../Initializer'))
class Init extends command_1.Command {
  async run() {
    const { args, flags } = this.parse(Init)
    await Initializer_1.default.init(
      flags.config,
      flags.yes,
      flags['skip-install'],
      flags.version,
      flags['skip-framework-detection'],
      flags.empty
    )
  }
}
exports.default = Init
Init.description = Initializer_1.default.description
Init.examples = [`$ fab init`, `$ fab init --config=fab.config.json5`]
Init.flags = {
  help: command_1.flags.help({ char: 'h' }),
  config: command_1.flags.string({
    char: 'c',
    description: 'Config filename',
    default: core_1.DEFAULT_CONFIG_FILENAME,
  }),
  yes: command_1.flags.boolean({
    char: 'y',
    description: 'Assume yes to all prompts (must be in the root directory of a project)',
  }),
  'skip-install': command_1.flags.boolean({
    description: 'Do not attempt to npm install anything',
  }),
  version: command_1.flags.string({
    description: 'What NPM version or dist-tag to use for installing FAB packages',
  }),
  'skip-framework-detection': command_1.flags.boolean({
    description: "Don't try to auto-detect framework, set up manually.",
  }),
  empty: command_1.flags.boolean({
    description: 'Install the packages and create an empty fab.config.json5 (implies -y)',
  }),
}
Init.args = []
//# sourceMappingURL=init.js.map
