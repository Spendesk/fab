'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const core_1 = require('@fab/core')
const cli_1 = require('@fab/cli')
const log = cli_1._log('Deployer')
class Deployer {
  static async deploy(
    config,
    file_path,
    package_dir,
    server_host,
    assets_host,
    envs,
    assets_only,
    assets_already_deployed_at,
    auto_install
  ) {
    this.auto_install = auto_install
    log(`💎 💚fab deployer💚 💎\n`)
    const { deploy } = config.data
    if (!deploy) {
      throw new cli_1.FabDeployError(`For the moment, you need to have your fab.config.json5 "deploy" section configured.
        See https://fab.dev/guides/deploying for more information.
        `)
    }
    const env_overrides = await this.getSettingsOverrides(config, envs)
    const { server_provider, assets_provider } = this.getProviders(
      deploy,
      server_host,
      assets_host,
      !!assets_already_deployed_at
    )
    log(`Creating package directory 💛${package_dir}💛:`)
    await fs_extra_1.default.ensureDir(package_dir)
    log.tick(`Done.`)
    if (assets_provider) {
      const deployed_url = await this.deployAssetsAndServer(
        file_path,
        package_dir,
        deploy,
        env_overrides,
        assets_provider,
        server_provider,
        assets_only
      )
      log(`💚SUCCESS💚: Deployed to 💛${deployed_url}💛`)
      return deployed_url
    } else {
      log(
        `💚NOTE:💚 skipping assets deploy, using 💛${assets_already_deployed_at}💛 for assets URL.`
      )
      const server_deployer = await this.loadPackage(server_provider, 'deployServer')
      const deployed_url = await this.deployServer(
        server_deployer,
        file_path,
        package_dir,
        this.resolveEnvVars(deploy[server_provider]),
        env_overrides,
        assets_already_deployed_at
      )
      log(`💚SUCCESS💚: Deployed to 💛${deployed_url}💛`)
      return deployed_url
    }
  }
  // TODO: this should be common somewhere
  static async getSettingsOverrides(config, envs) {
    var _a
    const env_overrides = new Map()
    if (!envs) {
      return new Map([['production', {}]])
    }
    for (const env of envs) {
      const overrides =
        (_a = config.data.settings) === null || _a === void 0 ? void 0 : _a[env]
      if (!overrides) {
        throw new cli_1.InvalidConfigError(`No environment '${env}' found in ${config}!`)
      }
      env_overrides.set(env, overrides)
    }
    return env_overrides
  }
  static async deployAssetsAndServer(
    file_path,
    package_dir,
    deploy,
    env_overrides,
    assets_provider,
    server_provider,
    assets_only
  ) {
    if (server_provider === assets_provider) {
      const deployer = await this.loadPackage(assets_provider, 'deployBoth')
      return deployer.deployBoth(
        file_path,
        package_dir,
        this.resolveEnvVars(deploy[assets_provider]),
        env_overrides
      )
    }
    const [assets_deployer, server_deployer] = await this.loadTwoPackages(
      assets_provider,
      'deployAssets',
      server_provider,
      'deployServer'
    )
    const assets_url = await assets_deployer.deployAssets(
      file_path,
      package_dir,
      this.resolveEnvVars(deploy[assets_provider])
    )
    log(`Assets deployed at 💛${assets_url}💛`)
    if (assets_only) return assets_url
    return await this.deployServer(
      server_deployer,
      file_path,
      package_dir,
      this.resolveEnvVars(deploy[server_provider]),
      env_overrides,
      assets_url
    )
  }
  static async loadPackage(provider, fn) {
    const pkg = core_1.HOSTING_PROVIDERS[provider].package_name
    const loaded = await cli_1.loadOrInstallModule(log, pkg, this.auto_install)
    if (typeof loaded[fn] !== 'function') {
      throw new cli_1.FabDeployError(`${pkg} doesn't export a '${fn}' method!`)
    }
    return loaded
  }
  static async loadTwoPackages(providerA, fnA, providerB, fnB) {
    const pkgA = core_1.HOSTING_PROVIDERS[providerA].package_name
    const pkgB = core_1.HOSTING_PROVIDERS[providerB].package_name
    const [loadedA, loadedB] = await cli_1.loadOrInstallModules(
      log,
      [pkgA, pkgB],
      this.auto_install
    )
    if (typeof loadedA[fnA] !== 'function') {
      throw new cli_1.FabDeployError(`${pkgA} doesn't export a '${fnA}' method!`)
    }
    if (typeof loadedB[fnB] !== 'function') {
      throw new cli_1.FabDeployError(`${pkgB} doesn't export a '${fnB}' method!`)
    }
    return [loadedA, loadedB]
  }
  static async deployServer(
    server_deployer,
    file_path,
    package_dir,
    config,
    env_overrides,
    assets_url
  ) {
    return await server_deployer.deployServer(
      file_path,
      package_dir,
      config,
      env_overrides,
      assets_url
    )
  }
  static getProviders(deploy, server_host, assets_host, skip_assets) {
    const targets = Object.keys(deploy)
    const assets_only_hosts = []
    const server_only_hosts = []
    const versatile_hosts = []
    for (const target of targets) {
      const provider = core_1.HOSTING_PROVIDERS[target]
      if (!provider) {
        throw new cli_1.FabDeployError(`Deploy target '${target}' in your fab.config.json5 not supported.
          Needs to be one of ${Object.keys(core_1.HOSTING_PROVIDERS).join(', ')}`)
      }
      if (provider.capabilities.server) {
        if (provider.capabilities.assets) {
          versatile_hosts.push(target)
        } else {
          server_only_hosts.push(target)
        }
      } else {
        if (provider.capabilities.assets) {
          assets_only_hosts.push(target)
        } else {
          throw new cli_1.FabDeployError(
            `Deploy target '${target}' doesn't host the server or the assets, what is it for?`
          )
        }
      }
    }
    const server_provider = this.resolveProvider(
      deploy,
      'server',
      server_host,
      server_only_hosts,
      versatile_hosts
    )
    if (skip_assets) return { server_provider }
    const assets_provider = this.resolveProvider(
      deploy,
      'assets',
      assets_host,
      assets_only_hosts,
      versatile_hosts
    )
    return { server_provider, assets_provider }
  }
  static resolveProvider(deploy, type, hard_coded, specific_hosts, versatile_hosts) {
    if (hard_coded) {
      const provider = deploy[hard_coded]
      if (provider) return hard_coded
      throw new cli_1.InvalidConfigError(
        `Your specified ${type} host '${hard_coded}' does not exist in your fab.config.json5 deploy config.`
      )
    }
    const chosen_provider = this.chooseProviderAutomatically(
      specific_hosts,
      type,
      versatile_hosts
    )
    const rejected_providers = [...specific_hosts, ...versatile_hosts].filter(
      (s) => s !== chosen_provider
    )
    log(`Deploying 💛${type}💛 with ${chosen_provider}.`)
    if (rejected_providers.length > 0)
      log(`Also found the following ${type}-compatible hosts configured:
        🖤${rejected_providers.join('\n')}🖤`)
    log(`Use the 💛--${type}-host💛 argument to override this.\n`)
    return chosen_provider
  }
  static chooseProviderAutomatically(specific_hosts, type, versatile_hosts) {
    if (specific_hosts.length === 1) {
      return specific_hosts[0]
    }
    if (specific_hosts.length > 1) {
      throw new cli_1.InvalidConfigError(`Your fab.config.json5 deploy config has multiple ${type}-only hosts: ${specific_hosts.join(
        ', '
      )}
        Choose one with the --${type}-host argument`)
    }
    if (versatile_hosts.length === 1) {
      return versatile_hosts[0]
    }
    if (versatile_hosts.length > 1) {
      throw new cli_1.InvalidConfigError(`Your fab.config.json5 deploy config has multiple hosts capable of both server & asset hosting: ${specific_hosts.join(
        ', '
      )}
        Specify which one to use with the --server-host & --assets-host arguments`)
    }
    throw new cli_1.InvalidConfigError(`Your fab.config.json5 deploy config has no entries for hosts capable of hosting your ${type}.
      See https://fab.dev/guides/deploying for more information.`)
  }
  static resolveEnvVars(config) {
    const result = {}
    const missing_env_vars = []
    for (const [k, v] of Object.entries(config)) {
      const match = typeof v === 'string' && v.match(core_1.ENV_VAR_SYNTAX)
      if (match) {
        const [_, env_var] = match
        if (!env_var) {
          log(
            `❤️WARNING:❤️ config value 💛${v}💛 looks like an environment variable but doesn't match pattern 💛${core_1.ENV_VAR_SYNTAX}💛`
          )
        }
        const value = process.env[env_var]
        if (typeof value === 'undefined' || value === '') {
          missing_env_vars.push(env_var)
        } else {
          result[k] = value
        }
      } else {
        result[k] = v
      }
    }
    if (missing_env_vars.length > 0) {
      throw new cli_1.InvalidConfigError(`Your deploy config references environment variables that weren't found:
        ${missing_env_vars.map((e) => `• 💛${e}💛`).join('\n')}`)
    }
    return result
  }
}
exports.default = Deployer
//# sourceMappingURL=Deployer.js.map
