import { PackageJson } from './constants'
import { FrameworkInfo } from './frameworks'
export default class Initializer {
  static description: string
  static yes: boolean
  static init(
    config_filename: string,
    yes: boolean,
    skip_install: boolean,
    version: string | undefined,
    skip_framework_detection: boolean,
    empty: boolean
  ): Promise<void>
  private static getFramework
  private static setupStaticFramework
  private static getPackageJson
  static determineProjectType(package_json: PackageJson): Promise<FrameworkInfo | null>
  static isNext9(package_json: PackageJson): Promise<false | FrameworkInfo>
  static isCreateReactApp(package_json: PackageJson): Promise<false | FrameworkInfo>
  static isGatsby(package_json: PackageJson): Promise<false | FrameworkInfo>
  static isExpo(package_json: PackageJson): Promise<false | FrameworkInfo>
  private static installDependencies
  private static updateConfig
  private static readExistingConfig
  private static addBuildFabScript
  private static addGitIgnores
  private static finalChecks
}
