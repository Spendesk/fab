'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
exports.DEFAULT_DEPS = ['@fab/cli', '@fab/server', '@fab/actions']
exports.DEPRECATED_PACKAGES = [
  '@fab/static',
  '@fab/compile',
  '@fab/nextjs',
  '@fab/serve',
  '@fab/serve-html',
  '@fab/rewire-assets',
]
exports.GITIGNORE_LINES = ['/.fab', '/fab.zip']
exports.GUESSED_OUTPUT_DIRS = ['build', 'dist', 'public', 'out']
exports.OUTPUT_DIR_EXAMPLES =
  exports.GUESSED_OUTPUT_DIRS.slice(0, exports.GUESSED_OUTPUT_DIRS.length - 1)
    .map((dir) => `💛${dir}💛`)
    .join(', ') + ` or 💛${exports.GUESSED_OUTPUT_DIRS.slice(-1)}💛`
exports.BASE_CONFIG = `// For more information, see https://fab.dev/kb/configuration
{
  plugins: {
    // This section defines your build & runtime toolchains. See https://fab.dev/kb/plugins
  },
  settings: {
    // This section defines the variables that are injected, depending on environment.
    // See https://fab.dev/kb/settings for more info.
    production: {
      // This environment is special. These variables get compiled into the FAB itself,
      // allowing for many production-specific optimisations. See https://fab.dev/kb/production
      // Example setting:
      // API_URL: 'https://api.example.com/graphql'
    },
  },
  deploy: {
    // For manual (command-line) deploys, add configuration here.
    // • See https://fab.dev/guides/deploying for more info.
    // However, we recommend automatic deploys (triggered by git push)
    // using a service such as Linc (https://linc.sh)
    // • See https://fab.dev/kb/automatic-deploys for setup instructions.
  }
}
`
//# sourceMappingURL=constants.js.map
