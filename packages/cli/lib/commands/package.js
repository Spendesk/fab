'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const core_1 = require('@fab/core')
const command_1 = require('@oclif/command')
const __1 = require('../')
const hosts = Object.keys(core_1.HOSTING_PROVIDERS)
class Deploy extends command_1.Command {
  async run() {
    const { args, flags } = this.parse(Deploy)
    const { file } = args
    if (!file) {
      this.error(`You must provide a FAB file to package (e.g. fab.zip)`)
    }
    if (!flags.target) {
      this.error(`You must provide a target. Available options: ${hosts.join(', ')}`)
    }
    const config = await __1.JSON5Config.readFrom(flags.config)
    const { Packager } = require('@fab/actions').default
    await Packager.package(
      file,
      config.data,
      flags.target,
      flags['output-path'],
      flags['assets-url'],
      flags.env
    )
  }
}
exports.default = Deploy
Deploy.description = 'Package a FAB to be uploaded to a hosting provider manually'
Deploy.examples = [`$ fab package --target=aws-lambda-edge fab.zip`]
Deploy.flags = {
  help: command_1.flags.help({ char: 'h' }),
  config: command_1.flags.string({
    char: 'c',
    description: 'Path to config file',
    default: core_1.DEFAULT_CONFIG_FILENAME,
  }),
  target: command_1.flags.enum({
    options: hosts,
    char: 't',
    description: `Hosting provider (must be one of: ${hosts.join(', ')})`,
  }),
  'output-path': command_1.flags.string({
    description: 'Where to save the packaged FAB (default .fab/deploy/[target].zip)',
  }),
  'assets-url': command_1.flags.string({
    description:
      'A URL for where the assets can be accessed, for server deployers that need it',
  }),
  env: command_1.flags.string({
    description:
      'Override production settings with a different environment defined in your FAB config file.',
  }),
}
Deploy.args = [{ name: 'file' }]
//# sourceMappingURL=package.js.map
