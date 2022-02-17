'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const command_1 = require('@oclif/command')
const core_1 = require('@fab/core')
const __1 = require('../')
const watcher_1 = require('../helpers/watcher')
class Build extends command_1.Command {
  async run() {
    const { args, flags } = this.parse(Build)
    const { Builder } = require('@fab/actions').default
    await watcher_1.watcher(flags.watch, async () => {
      const config = await __1.JSON5Config.readFrom(flags.config)
      await Builder.build(
        flags.config,
        config.data,
        flags['skip-cache'],
        flags['skip-typecheck'],
        flags['minify']
      )
    })
  }
}
exports.default = Build
Build.description = 'Generate a FAB given the config (usually in fab.config.json5)'
Build.examples = [
  `$ fab build`,
  `$ fab build --config=fab.config.json5`,
  `$ fab build --watch dist --watch fab.config.json5`,
]
Build.flags = {
  help: command_1.flags.help({ char: 'h' }),
  config: command_1.flags.string({
    char: 'c',
    description: 'Path to config file',
    default: core_1.DEFAULT_CONFIG_FILENAME,
  }),
  'skip-cache': command_1.flags.boolean({
    description: 'Skip any caching of intermediate build artifacts',
  }),
  watch: command_1.flags.string({
    multiple: true,
    description:
      'Re-run the builder if any of the listed files change. Pass this argument multiple times to watch multiple files/directories.',
  }),
  'skip-typecheck': command_1.flags.boolean({
    description:
      "Skip the background typechecking of your FAB plugins if it's slow or flaky.",
  }),
  minify: command_1.flags.boolean({
    description: 'Minify the generated server.js file.',
  }),
}
Build.args = []
//# sourceMappingURL=build.js.map
