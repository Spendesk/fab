'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const command_1 = require('@oclif/command')
const core_1 = require('@fab/core')
const __1 = require('../')
const fs_extra_1 = __importDefault(require('fs-extra'))
class Deploy extends command_1.Command {
  async run() {
    const { args, flags } = this.parse(Deploy)
    const { file: specified_file } = args
    const default_file = 'fab.zip'
    if (specified_file) {
      if (!(await fs_extra_1.default.pathExists(specified_file))) {
        this.error(`ERROR: Cannot file find file '${specified_file}'.\n`)
        this._help()
      }
    } else if (!(await fs_extra_1.default.pathExists(default_file))) {
      this.error(
        `ERROR: You must provide a FAB filename to deploy, if '${default_file}' is not present in the current directory.\n`
      )
      this._help()
    }
    const file = specified_file || default_file
    const config = await __1.JSON5Config.readFrom(flags.config)
    const { Deployer } = require('@fab/actions').default
    await Deployer.deploy(
      config,
      file,
      flags['package-dir'] || '.fab/deploy',
      flags['server-host'],
      flags['assets-host'],
      flags.env,
      flags['assets-only'],
      flags['assets-already-deployed-at'],
      flags['auto-install']
    )
  }
}
exports.default = Deploy
Deploy.description = 'Deploy a FAB to a hosting provider'
Deploy.examples = [`$ fab deploy fab.zip`]
Deploy.flags = {
  help: command_1.flags.help({ char: 'h' }),
  config: command_1.flags.string({
    char: 'c',
    description: 'Path to config file',
    default: core_1.DEFAULT_CONFIG_FILENAME,
  }),
  'package-dir': command_1.flags.string({
    description: 'Where to save the packaged FAB files (default .fab/deploy)',
  }),
  'server-host': command_1.flags.enum({
    options: Object.keys(core_1.HOSTING_PROVIDERS),
    description:
      'If you have multiple potential hosts for the server defined in your fab.config.json5, which one to deploy to.',
  }),
  'assets-host': command_1.flags.enum({
    options: Object.keys(core_1.HOSTING_PROVIDERS),
    description:
      'If you have multiple potential hosts for the assets defined in your fab.config.json5, which one to deploy to.',
  }),
  env: command_1.flags.string({
    description:
      'Override production settings with a different environment defined in your FAB config file.',
    multiple: true,
  }),
  'assets-already-deployed-at': command_1.flags.string({
    description:
      'Skip asset deploys and only deploy the server component pointing at this URL for assets',
  }),
  'assets-only': command_1.flags.boolean({
    description: 'Skip server deploy, just upload assets',
  }),
  'auto-install': command_1.flags.boolean({
    description:
      'If you need dependent packages (e.g. @fab/deploy-*), install them without prompting',
  }),
}
Deploy.args = [{ name: 'file' }]
//# sourceMappingURL=deploy.js.map
