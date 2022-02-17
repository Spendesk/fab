'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const pkg_up_1 = __importDefault(require('pkg-up'))
const path_1 = __importDefault(require('path'))
const semver_1 = __importDefault(require('semver'))
const find_yarn_workspace_root_1 = __importDefault(require('find-yarn-workspace-root'))
const __1 = require('../')
const constants_1 = require('./constants')
const frameworks_1 = require('./frameworks')
const utils_1 = require('./utils')
const execa_1 = __importDefault(require('execa'))
const cross_fetch_1 = __importDefault(require('cross-fetch'))
const promptWithDefault = async (message, examples, def, yes) => {
  // console.log({message, examples, def, yes})
  utils_1.log(message)
  if (yes) {
    if (def) {
      utils_1.log(`  -y set, using 💛${def}💛\n`)
      return def
    }
    throw new __1.FabInitError('-y specified but no default found!')
  }
  return await (def ? __1.prompt('> ', { default: def }) : __1.prompt(examples))
}
const getLatestFabCli = async () => {
  const response = await cross_fetch_1.default(
    'https://registry.npmjs.org/@fab/cli/latest'
  )
  const data = await response.json()
  if (data && data.version) {
    const installed = JSON.parse(
      await fs_extra_1.default.readFile(
        path_1.default.resolve(__dirname, '../../package.json'),
        'utf8'
      )
    )
    if (installed.version !== data.version) {
      utils_1.log(
        `💚NOTE💚: You have 🖤@fab/cli🖤 💛${installed.version}💛, latest available on NPM is 💛${data.version}💛.`
      )
    }
  }
  return data
}
const getLatestSupportedFrameworks = async () => {
  const response = await cross_fetch_1.default(
    'https://raw.githubusercontent.com/fab-spec/fab/master/tests/latest-supported-version/package.json'
  )
  return await response.json()
}
let version_info
const getLatestVersionInfo = () => {
  if (!version_info) {
    const timeout = new Promise((res) => setTimeout(res, 4000))
    version_info = Promise.all([
      Promise.race([timeout, getLatestFabCli()]).catch(() => null),
      Promise.race([timeout, getLatestSupportedFrameworks()]).catch(() => null),
    ]).then(([latest_cli, latest_frameworks]) => ({
      latest_cli,
      latest_frameworks,
    }))
  }
  return version_info
}
class Initializer {
  static async init(
    config_filename,
    yes,
    skip_install,
    version,
    skip_framework_detection,
    empty
  ) {
    this.yes = yes || empty
    utils_1.log.announce(`fab init — ${this.description}`)
    // Kick off the version check early but don't await it here7
    getLatestVersionInfo()
    /* First, figure out the nearest package.json */
    const package_json_path = await pkg_up_1.default()
    if (!package_json_path) {
      throw new __1.FabInitError(
        `Cannot find a package.json in this or any parent directory`
      )
    }
    const root_dir = path_1.default.dirname(package_json_path)
    if (root_dir !== process.cwd()) {
      if (this.yes) {
        throw new __1.FabInitError(
          `Note: fab init -y must be run from the root of your project (where your package.json lives) since it will automatically change files.`
        )
      } else {
        utils_1.log(
          `❤️Warning:❤️ There's no package.json in this directory, the nearest is at 💚${path_1.default.relative(
            process.cwd(),
            package_json_path
          )}💚`
        )
        const confirmed = await utils_1.log.confirmAndRespond(
          `💛Are you sure you want to configure a FAB here?💛`
        )
        if (!confirmed) return
      }
    }
    /* Then, figure out what kind of project we are */
    const package_json = await this.getPackageJson(package_json_path)
    // if our current directory is managed as a yarn workspace, the yarn.lock file will
    // be located in the project root instead of the current package directory - so
    // useYarn should check there to see if this project uses yarn
    const yarn_root = find_yarn_workspace_root_1.default(root_dir) || root_dir
    const use_yarn = await __1.useYarn(yarn_root)
    const additional_dependencies = []
    if (empty) {
      /* Generate/update the FAB config file */
      await this.updateConfig(root_dir, config_filename, {}, true)
    } else {
      const framework = await this.getFramework(
        package_json,
        root_dir,
        skip_framework_detection
      )
      if (!framework) return
      if (this.yes) {
        utils_1.log.info(`Proceeding...`)
      } else {
        utils_1.log(`💚Ready to proceed.💚 This process will:
        • Generate a 💛fab.config.json5💛 file for your project
        • Add 💛build:fab💛 and related scripts to your 💛package.json💛
        • Add 💛.fab💛 and 💛fab.zip💛 to your 💛.gitignore💛
        • Install 💛@fab/cli💛 and related dependencies using 💛${
          use_yarn ? 'yarn' : 'npm'
        }💛`)
        const confirmed = await utils_1.log.confirmAndRespond(`Good to go? [y/N]`)
        if (!confirmed) return
      }
      /* Next, generate/update the FAB config file */
      await this.updateConfig(root_dir, config_filename, framework.plugins)
      /* Then, update the package.json to add a build:fab script */
      await this.addBuildFabScript(package_json_path, package_json, framework)
      additional_dependencies.push(...Object.keys(framework.plugins))
      /* Add any framework-specific config required */
      if (framework.customConfig)
        additional_dependencies.push(
          ...(await framework.customConfig(root_dir, package_json))
        )
    }
    /* Update the .gitignore file (if it exists) to add .fab and fab.zip */
    await this.addGitIgnores(root_dir)
    /* Finally, install the dependencies */
    if (!skip_install) {
      await this.installDependencies(root_dir, version, use_yarn, additional_dependencies)
    } else {
      utils_1.log(`Skipping dependency installation as 💛--skip-install💛 is set.
      We would have installed: 🖤${additional_dependencies.join(' ')}🖤`)
    }
    await this.finalChecks(root_dir, package_json)
    // Should already be finished or awaited elsewhere, but just to clean things up:
    await getLatestVersionInfo()
    utils_1.log(`💎 All good 💎`) /**/
  }
  static async getFramework(package_json, root_dir, skip_framework_detection) {
    const framework = skip_framework_detection
      ? null
      : await this.determineProjectType(package_json)
    if (framework) {
      utils_1.log(
        `💚Success!💚 Found a 💛${framework.name}💛 project. We know exactly how to configure this 👍`
      )
      return framework
    } else {
      if (skip_framework_detection) {
        utils_1.log(`❤️Skipping framework detection.❤️`)
      } else {
        utils_1.log(`❤️Warning: Could not find a known framework to auto-generate config.❤️
        Currently supported frameworks for auto-detection are:
        • 💛${frameworks_1.FRAMEWORK_NAMES.join('\n• ')}💛

        If your project uses one of these but wasn't detected, please raise an issue: https://github.com/fab-spec/fab/issues.
      `)
      }
      utils_1.log(`
        💚NOTE: if your site is statically-rendered (e.g. JAMstack) we can still set things up.💚
        Check https://fab.dev/kb/static-sites for more info.

        We'll need your:
        • Build command (usually 💛npm run build💛)
        • Output directory (usually ${constants_1.OUTPUT_DIR_EXAMPLES})
      `)
      const attempt_static =
        this.yes || (await utils_1.log.confirmAndRespond(`Would you like to proceed?`))
      if (!attempt_static) return
      return await this.setupStaticFramework(package_json, root_dir)
    }
  }
  static async setupStaticFramework(package_json, root_dir) {
    var _a
    const npm_build_exists = !!((_a = package_json.scripts) === null || _a === void 0
      ? void 0
      : _a.build)
    const npm_run_build = `npm run build`
    const build_cmd = await promptWithDefault(
      `What command do you use to build your project?`,
      `(usually something like "npm run xyz")`,
      npm_build_exists && npm_run_build,
      this.yes
    )
    // console.log({ build_cmd })
    let found_output_dir
    for (const dir of constants_1.GUESSED_OUTPUT_DIRS) {
      const joined_path = path_1.default.join(root_dir, dir)
      if (await fs_extra_1.default.pathExists(joined_path)) {
        found_output_dir = dir
        break
      }
    }
    const output_dir = await promptWithDefault(
      `Where is your project built into?`,
      `(e.g. ${constants_1.OUTPUT_DIR_EXAMPLES})`,
      found_output_dir,
      this.yes
    )
    return frameworks_1.GenericStatic(build_cmd, output_dir)
  }
  static async getPackageJson(package_json_path) {
    try {
      return JSON.parse(await fs_extra_1.default.readFile(package_json_path, 'utf8'))
    } catch (e) {
      throw new __1.FabInitError(`Something went wrong parsing ${package_json_path}!`)
    }
  }
  static async determineProjectType(package_json) {
    utils_1.log(`Searching for a 💛known project type💛...
    🖤If your project is not correctly detected,🖤
    🖤or if the generated config is incorrect,🖤
    🖤please leave some feedback at🖤 💛https://fab.dev/guides/known-project-types💛`)
    return (
      (await this.isNext9(package_json)) ||
      (await this.isCreateReactApp(package_json)) ||
      (await this.isGatsby(package_json)) ||
      (await this.isExpo(package_json)) ||
      null
    )
  }
  static async isNext9(package_json) {
    var _a, _b, _c, _d, _e, _f, _g, _h
    const nextjs_version =
      ((_a = package_json.dependencies) === null || _a === void 0
        ? void 0
        : _a['next']) ||
      ((_b = package_json.devDependencies) === null || _b === void 0
        ? void 0
        : _b['next'])
    if (!nextjs_version) return false
    const next_build =
      (_d = (_c = package_json.scripts) === null || _c === void 0 ? void 0 : _c.build) ===
        null || _d === void 0
        ? void 0
        : _d.match(/next build/)
    const next_build_export =
      (_f = (_e = package_json.scripts) === null || _e === void 0 ? void 0 : _e.build) ===
        null || _f === void 0
        ? void 0
        : _f.match(/next export/)
    const next_export =
      (_h =
        (_g = package_json.scripts) === null || _g === void 0 ? void 0 : _g.export) ===
        null || _h === void 0
        ? void 0
        : _h.match(/next export/)
    const activeNextProject =
      (await fs_extra_1.default.pathExists('.next')) ||
      next_build ||
      next_build_export ||
      next_export
    if (!activeNextProject) {
      throw new __1.FabInitError(
        `Detected NextJS as a dependency but no .next directory found & npm run build doesn't contain 'next build'!`
      )
    }
    if (semver_1.default.valid(nextjs_version)) {
      const current_version = semver_1.default.coerce(nextjs_version)
      if (semver_1.default.lt(current_version, '9.0.0')) {
        throw new __1.FabInitError(
          `Detected a NextJS project but using an older version (${nextjs_version}). FABs currently only support NextJS v9 or later.`
        )
      }
      const { latest_frameworks } = await getLatestVersionInfo()
      if (latest_frameworks) {
        const latest_supported = latest_frameworks.dependencies.next
        if (
          semver_1.default.lt(semver_1.default.coerce(latest_supported), current_version)
        ) {
          utils_1.log.warn(
            `WARNING: NextJS on FABs only tested up until ${latest_supported}. You have ${current_version}.`
          )
          utils_1.log(
            `If you have trouble, consider rolling back your local NextJS version.`
          )
        }
      }
    }
    if (next_build_export) {
      return frameworks_1.Frameworks.Next9({
        export_build: true,
        build_cmd: 'npm run build',
      })
    } else if (next_export) {
      if (!next_build) {
        return frameworks_1.Frameworks.Next9({
          export_build: true,
          build_cmd: 'npm run export',
        })
      }
      utils_1.log(`You have both 💛next build💛 and 💛next export💛 in your npm scripts.
        What command do you use to build your project?
        • for dynamic (serverless) sites, this is 💛npm run build💛,
        • or for static sites this is 💛npm run export💛
      `)
      const build_cmd = await promptWithDefault(
        `Your build command`,
        ``,
        'npm run export',
        this.yes
      )
      const export_build =
        this.yes || build_cmd === 'npm run export'
          ? true
          : await utils_1.log.confirmAndRespond(
              `Is this a static (i.e. 💛next export💛) site?`
            )
      return frameworks_1.Frameworks.Next9({ export_build, build_cmd })
    } else {
      return frameworks_1.Frameworks.Next9({
        export_build: false,
        build_cmd: 'npm run build',
      })
    }
  }
  static async isCreateReactApp(package_json) {
    var _a, _b
    const react_scripts_version =
      ((_a = package_json.dependencies) === null || _a === void 0
        ? void 0
        : _a['react-scripts']) ||
      ((_b = package_json.devDependencies) === null || _b === void 0
        ? void 0
        : _b['react-scripts'])
    if (!react_scripts_version) return false
    if (
      semver_1.default.valid(react_scripts_version) &&
      semver_1.default.lt(semver_1.default.coerce(react_scripts_version), '2.0.0')
    ) {
      throw new __1.FabInitError(
        `Detected a Create React App project but using an older version of react-scripts (${react_scripts_version}). FABs only support v2+.`
      )
    }
    return frameworks_1.Frameworks.CreateReactApp()
  }
  static async isGatsby(package_json) {
    var _a, _b, _c, _d
    const gatsby_dep =
      ((_a = package_json.dependencies) === null || _a === void 0
        ? void 0
        : _a['gatsby']) ||
      ((_b = package_json.devDependencies) === null || _b === void 0
        ? void 0
        : _b['gatsby'])
    if (!gatsby_dep) return false
    if (
      !((_d =
        (_c = package_json.scripts) === null || _c === void 0 ? void 0 : _c.build) ===
        null || _d === void 0
        ? void 0
        : _d.match(/gatsby build/))
    ) {
      throw new __1.FabInitError(
        `Detected Gatsby as a dependency but npm run build doesn't contain 'gatsby build'`
      )
    }
    return frameworks_1.Frameworks.Gatsby()
  }
  static async isExpo(package_json) {
    var _a, _b, _c, _d, _e, _f
    const expo_dep =
      ((_a = package_json.dependencies) === null || _a === void 0
        ? void 0
        : _a['expo']) ||
      ((_b = package_json.devDependencies) === null || _b === void 0
        ? void 0
        : _b['expo'])
    if (!expo_dep) return false
    if (
      ((_d = (_c = package_json.scripts) === null || _c === void 0 ? void 0 : _c.web) ===
        null || _d === void 0
        ? void 0
        : _d.match(/expo start/)) ||
      ((_f =
        (_e = package_json.scripts) === null || _e === void 0 ? void 0 : _e.start) ===
        null || _f === void 0
        ? void 0
        : _f.match(/expo start/))
    ) {
      return frameworks_1.Frameworks.Expo()
    } else {
      utils_1.log(
        `❤️Warning:❤️ Detected a project with a dependency on 💛expo💛 but no 💛expo start💛 scripts in 💛package.json💛. Skipping.`
      )
    }
    return false
  }
  static async installDependencies(root_dir, version, use_yarn, plugin_deps) {
    const versioned = (deps) => deps.map((dep) => (version ? `${dep}@${version}` : dep))
    const core_deps = versioned(constants_1.DEFAULT_DEPS)
    const framework_deps = versioned(plugin_deps)
    utils_1.log.note(`Installing required 💛FAB core💛 dependencies:
      ${core_deps.map((d) => `• ${d}`).join('\n  ')}`)
    utils_1.log(`and the following 💛project-specific💛 plugins:
      ${framework_deps.map((d) => `• ${d}`).join('\n  ')}`)
    utils_1.log(`using 💛${use_yarn ? 'yarn' : 'npm'}...💛`)
    await __1.installDependencies(use_yarn, [...core_deps, ...framework_deps], root_dir)
    utils_1.log(`💚Done!💚`)
    utils_1.log(`Now run 💛${
      use_yarn ? 'yarn' : 'npm run'
    } build:fab💛 to build your project and generate a FAB from it!
      or visit 💛https://fab.dev/guides/getting-started💛 for more info.`)
  }
  static async updateConfig(
    root_dir,
    config_filename,
    plugins,
    auto_skip_if_exists = false
  ) {
    const config_path = path_1.default.resolve(root_dir, config_filename)
    const config = await this.readExistingConfig(config_path)
    if (Object.keys(config.data.plugins).length > 0) {
      if (auto_skip_if_exists) return
      utils_1.log.warn(`Existing config has a "plugins" section.`)
      const confirmed =
        (this.yes && utils_1.log(`Overwriting since -y is set.`)) ||
        (await utils_1.log.confirmAndRespond(
          `Would you like to overwrite it?`,
          `Ok, overwriting...`,
          `Ok, leaving as-is.`
        ))
      if (!confirmed) return
    }
    config.data.plugins = plugins
    await config.write(config_filename)
    try {
      await execa_1.default.command(`git add ${config_filename}`)
    } catch (e) {
      utils_1.log.warn(`Error adding ${config_filename} to git. Skipping...`)
    }
  }
  static async readExistingConfig(config_path) {
    if (await fs_extra_1.default.pathExists(config_path)) {
      return await __1.JSON5Config.readFrom(config_path)
    } else {
      return __1.JSON5Config.generate(constants_1.BASE_CONFIG)
    }
  }
  static async addBuildFabScript(package_json_path, package_json, framework) {
    var _a
    if (
      !this.yes &&
      ((_a = package_json.scripts) === null || _a === void 0 ? void 0 : _a['build:fab'])
    ) {
      utils_1.log.info(`Already detected a build:fab command.`)
      utils_1.log(`We want to add/overwrite the following lines to your 💛package.json💛:
        💛${JSON.stringify(framework.scripts, null, 2)}💛
      `)
      const ok = await utils_1.log.confirmAndRespond(`Overwrite existing scripts?`)
      if (!ok) return
    }
    await fs_extra_1.default.writeFile(
      package_json_path,
      JSON.stringify(
        {
          ...package_json,
          scripts: utils_1.mergeScriptsAfterBuild(
            package_json.scripts,
            framework.scripts
          ),
        },
        null,
        2
      )
    )
  }
  static async addGitIgnores(root_dir) {
    const gitignore_path = path_1.default.join(root_dir, '.gitignore')
    if (await fs_extra_1.default.pathExists(gitignore_path)) {
      const gitignore = await fs_extra_1.default.readFile(gitignore_path, 'utf8')
      const ignore_lines = gitignore.split('\n').map((line) => line.trim())
      const lines_set = new Set(ignore_lines)
      const lines_to_add = constants_1.GITIGNORE_LINES.filter(
        (line) => !lines_set.has(line) && !lines_set.has(line.slice(1))
      )
      if (lines_to_add.length > 0) {
        await fs_extra_1.default.writeFile(
          gitignore_path,
          [...ignore_lines, ...lines_to_add].join('\n') + '\n'
        )
      }
    }
  }
  /* Make sure the repo is OK */
  static async finalChecks(root_dir, package_json) {
    const deprecated = constants_1.DEPRECATED_PACKAGES
    const deps = new Set([
      ...Object.keys(package_json.dependencies || {}),
      ...Object.keys(package_json.devDependencies || {}),
    ])
    const warn_about = deprecated.filter((dep) => deps.has(dep))
    if (warn_about.length > 0) {
      utils_1.log(
        `❤️WARNING:❤️ you have deprecated FAB dependencies in your package.json: 💛${warn_about.join(
          ', '
        )}💛`
      )
    }
    const old_prod_settings_file = 'production-settings.json'
    if (
      await fs_extra_1.default.pathExists(
        path_1.default.join(root_dir, old_prod_settings_file)
      )
    ) {
      utils_1.log(
        `❤️WARNING:❤️ you have a 💛${old_prod_settings_file}💛 file in this directory.\nSettings are now part of 💛fab.config.json5💛, read more at 🖤https://fab.dev/kb/settings🖤.`
      )
    }
  }
}
exports.default = Initializer
Initializer.description = `Auto-configure a repo for generating FABs`
//# sourceMappingURL=index.js.map
