'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
const core_1 = require('@fab/core')
const cli_1 = require('@fab/cli')
const log = cli_1._log(`Packager`)
function isFabPackagerExports(p) {
  return p.createPackage
}
class Packager {}
exports.default = Packager
Packager.package = async (file_path, config, target, output_path, assets_url, env) => {
  log(`💎 💚fab package💚 💎\n`)
  const provider = core_1.HOSTING_PROVIDERS[target]
  if (!provider) {
    throw new cli_1.FabPackageError(`Target '${target}' not supported.
        Needs to be one of ${Object.keys(core_1.HOSTING_PROVIDERS).join(', ')}`)
  }
  if (!output_path) output_path = `.fab/deploy/${target}.${provider.extension}`
  const { package_name } = provider
  log(`Loading packager code from ${package_name}`)
  const packager = cli_1.loadModule(log, package_name)
  log.tick(`Done.`)
  if (!isFabPackagerExports(packager)) {
    throw new cli_1.FabPackageError(`Error: module 💛${package_name}💛 can't create a package.
        This could be because this module is only for deploying static assets, not server components.
        Packaging is only relevant to the server component.
        See 🖤https://fab.dev/kb/deploying🖤 for more information.`)
  }
  if (env) throw new Error('Not implemented ENV support yet')
  const env_overrides = new Map()
  const deploy_config = config.deploy[target]
  await packager.createPackage(
    file_path,
    output_path,
    deploy_config,
    env_overrides,
    assets_url
  )
}
//# sourceMappingURL=Packager.js.map
