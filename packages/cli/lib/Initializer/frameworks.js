'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const path_1 = __importDefault(require('path'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const utils_1 = require('./utils')
const execa_1 = __importDefault(require('execa'))
const static_plugin_chain = (dir, fallback = '/index.html') => ({
  '@fab/input-static': {
    dir,
  },
  '@fab/plugin-render-html': {
    fallback,
  },
  '@fab/plugin-rewire-assets': {},
})
exports.Frameworks = {
  CreateReactApp: () => ({
    name: 'Create React App',
    scripts: {
      'build:fab': 'npm run build && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('build'),
  }),
  Gatsby: () => ({
    name: 'Gatbsy JS',
    scripts: {
      'build:fab': 'npm run build && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('public', false),
  }),
  Expo: () => ({
    name: 'Expo Web',
    scripts: {
      'build:fab': 'expo build:web && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('web-build'),
    async customConfig(root_dir, package_json) {
      var _a, _b
      const has_expo_cli =
        ((_a = package_json.dependencies) === null || _a === void 0
          ? void 0
          : _a['expo-cli']) ||
        ((_b = package_json.devDependencies) === null || _b === void 0
          ? void 0
          : _b['expo-cli'])
      if (has_expo_cli) {
        utils_1.log(`Detected 💛expo-cli💛 in package.json, proceeding...`)
        return []
      }
      try {
        await execa_1.default.command(`expo-cli -V`)
        utils_1.log(
          `💚Note:💚 your project doesn't explicitly depend on 💛expo-cli💛, but it is installed globally. We will add it as a 💛devDependency💛 since it makes this project more portable...`
        )
        return []
      } catch (e) {
        utils_1.log(
          `❤️WARNING:❤️ your project doesn't depend on 💛expo-cli💛, and it doesn't seem to be installed globally. Adding it as a 💛devDependency💛...`
        )
      }
      return ['expo-cli']
    },
  }),
  Next9: ({ export_build, build_cmd }) => ({
    name: `NextJS v9+ (${export_build ? 'static' : 'dynamic'})`,
    scripts: {
      'build:fab': `${build_cmd} && npm run fab:build`,
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: export_build
      ? static_plugin_chain('out')
      : {
          '@fab/input-nextjs': {
            dir: '.next',
          },
          '@fab/plugin-render-html': {
            fallback: false,
          },
          '@fab/plugin-rewire-assets': {},
        },
    async customConfig(root_dir) {
      if (export_build) return []
      const config_path = path_1.default.join(root_dir, 'next.config.js')
      if (await fs_extra_1.default.pathExists(config_path)) {
        const next_config = require(config_path)
        if (next_config.target !== 'serverless') {
          utils_1.log(`❤️WARNING: Your NextJS project is not currently configured for a serverless build.❤️
            ${
              next_config.target
                ? `Add 💛target: 'serverless'💛 to your 💛next.config.js💛 file.`
                : `Currently your app is configured to build in 💛${next_config.target ||
                    'server'}💛 mode.
                Update this in your 💛next.config.js💛 by setting 💛target: 'serverless'💛`
            }
            Continuing setup, but ❤️fab build will fail❤️ until this is changed.`)
        } else {
          utils_1.log(`Your app is already configured for a severless build. Proceeding.`)
        }
      } else {
        utils_1.log(
          `No 💛next.config.js💛 found, adding one to set 💛target: 'serverless'💛`
        )
        await fs_extra_1.default.writeFile(
          config_path,
          `module.exports = {\n  target: 'serverless'\n}\n`
        )
      }
      return []
    },
  }),
}
exports.GenericStatic = (build_cmd, found_output_dir) => {
  return {
    name: 'Static Site',
    scripts: {
      'build:fab': `${build_cmd} && npm run fab:build`,
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain(found_output_dir),
  }
}
exports.FRAMEWORK_NAMES = Object.keys(exports.Frameworks)
//# sourceMappingURL=frameworks.js.map
