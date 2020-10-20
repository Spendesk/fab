import { BuildConfig } from '@fab/core'
import path from 'path'
import fs from 'fs-extra'
import { log } from '../'

const static_plugin_chain = (
  dir: string,
  fallback: string | boolean = '/index.html'
) => ({
  '@fab/input-static': {
    dir,
  },
  '@fab/plugin-render-html': {
    fallback,
  },
  '@fab/plugin-rewire-assets': {},
})

export type FrameworkInfo = {
  name: string
  plugins: BuildConfig
  scripts: { [name: string]: string }
  customConfig?: (root_dir: string) => void
}
export const Frameworks = {
  CreateReactApp: (): FrameworkInfo => ({
    name: 'Create React App',
    scripts: {
      'build:fab': 'npm run build && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('build'),
  }),
  Gatsby: (): FrameworkInfo => ({
    name: 'Gatbsy JS',
    scripts: {
      'build:fab': 'npm run build && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('public', false),
  }),
  Expo: (): FrameworkInfo => ({
    name: 'Expo Web',
    scripts: {
      'build:fab': 'expo build:web && npm run fab:build',
      'fab:build': 'fab build',
      'fab:serve': 'fab serve fab.zip',
    },
    plugins: static_plugin_chain('web-build'),
  }),
  Next9: ({
    export_build,
    build_cmd,
  }: {
    export_build: boolean
    build_cmd: string
  }): FrameworkInfo => ({
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
    async customConfig(root_dir: string) {
      if (export_build) return
      const config_path = path.join(root_dir, 'next.config.js')
      if (await fs.pathExists(config_path)) {
        const next_config = require(config_path)
        if (next_config.target !== 'serverless') {
          log(
            `❤️WARNING: Your NextJS project is not currently configured for a serverless build.❤️
            ${
              next_config.target
                ? `Add 💛target: 'serverless'💛 to your 💛next.config.js💛 file.`
                : `Currently your app is configured to build in 💛${next_config.target ||
                    'server'}💛 mode.
                Update this in your 💛next.config.js💛 by setting 💛target: 'serverless'💛`
            }
            Continuing setup, but ❤️fab build will fail❤️ until this is changed.`
          )
        } else {
          log(`Your app is already configured for a severless build. Proceeding.`)
        }
      } else {
        log(`No 💛next.config.js💛 found, adding one to set 💛target: 'serverless'💛`)
        await fs.writeFile(config_path, `module.exports = {\n  target: 'serverless'\n}\n`)
      }
    },
  }),
}
export const GenericStatic = (
  build_cmd: string,
  found_output_dir: string
): FrameworkInfo => {
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

export const FRAMEWORK_NAMES = Object.keys(Frameworks)
