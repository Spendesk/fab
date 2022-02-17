import { DeployProviders } from '@fab/core'
import { JSON5Config } from '@fab/cli'
export default class Deployer {
  private static auto_install
  static deploy(
    config: JSON5Config,
    file_path: string,
    package_dir: string,
    server_host: DeployProviders | undefined,
    assets_host: DeployProviders | undefined,
    envs: string[] | undefined,
    assets_only: boolean,
    assets_already_deployed_at: string | undefined,
    auto_install: boolean
  ): Promise<string | string[]>
  private static getSettingsOverrides
  private static deployAssetsAndServer
  private static loadPackage
  private static loadTwoPackages
  private static deployServer
  private static getProviders
  private static resolveProvider
  private static chooseProviderAutomatically
  private static resolveEnvVars
}
