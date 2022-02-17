'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const command_1 = require('@oclif/command')
const core_1 = require('@fab/core')
const helpers_1 = require('../helpers')
const fs_extra_1 = __importDefault(require('fs-extra'))
const log = helpers_1._log(`Server`)
class Serve extends command_1.Command {
  async run() {
    const { args, flags } = this.parse(Serve)
    const { file: specified_file } = args
    const default_file = 'fab.zip'
    if (specified_file) {
      if (!(await fs_extra_1.default.pathExists(specified_file))) {
        log.error(`ERROR: Cannot file find file '${specified_file}'.\n`)
        this._help()
      }
    } else if (!(await fs_extra_1.default.pathExists(default_file))) {
      log.error(
        `ERROR: You must provide a FAB filename to serve, if '${default_file}' is not present in the current directory.\n`
      )
      this._help()
    }
    const file = specified_file || default_file
    log.announce(`fab serve`)
    const server_pkg = (
      await helpers_1.loadOrInstallModule(log, '@fab/server', flags['auto-install'])
    ).default
    const server = server_pkg.createServer(file, flags)
    await server.serve(
      flags['experimental-v8-sandbox']
        ? core_1.SandboxType.v8isolate
        : core_1.SandboxType.nodeVm,
      flags.watch,
      flags['proxy-ws']
    )
  }
}
exports.default = Serve
Serve.description = 'fab serve: Serve a FAB in a local NodeJS Express server'
Serve.examples = [
  `$ fab serve fab.zip`,
  `$ fab serve --port=3001 fab.zip`,
  `$ fab serve --cert=local-ssl.cert --key=local-ssl.key fab.zip`,
  `$ fab serve --env=staging fab.zip`,
]
Serve.flags = {
  help: command_1.flags.help({ char: 'h' }),
  port: command_1.flags.string({
    description: 'Port to use',
    env: 'PORT',
    default: '3000',
    required: true,
  }),
  cert: command_1.flags.string({
    description: 'SSL certificate to use',
  }),
  key: command_1.flags.string({
    description: 'Key for the SSL Certificate',
  }),
  'experimental-v8-sandbox': command_1.flags.boolean({
    description:
      'Enable experimental V8::Isolate Runtime (in development, currently non-functional)',
  }),
  env: command_1.flags.string({
    description:
      'Override production settings with a different environment defined in your FAB config file.',
  }),
  config: command_1.flags.string({
    char: 'c',
    description: 'Path to config file. Only used for SETTINGS in conjunction with --env.',
    default: core_1.DEFAULT_CONFIG_FILENAME,
  }),
  'auto-install': command_1.flags.boolean({
    description:
      'If you need dependent packages (e.g. @fab/serve), install them without prompting',
  }),
  watch: command_1.flags.boolean({
    description: 'EXPERIMENTAL: Watches fab.zip and restarts the server when it changes.',
  }),
  'proxy-ws': command_1.flags.string({
    description: 'EXPERIMENTAL: Proxy websocket requests to a different port',
  }),
}
Serve.args = [{ name: 'file' }]
//# sourceMappingURL=serve.js.map
