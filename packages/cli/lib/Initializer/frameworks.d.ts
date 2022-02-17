import { BuildConfig } from '@fab/core'
import { PackageJson } from './constants'
export declare type FrameworkInfo = {
  name: string
  plugins: BuildConfig
  scripts: {
    [name: string]: string
  }
  customConfig?: (root_dir: string, package_json: PackageJson) => Promise<string[]>
}
export declare const Frameworks: {
  CreateReactApp: () => FrameworkInfo
  Gatsby: () => FrameworkInfo
  Expo: () => FrameworkInfo
  Next9: ({
    export_build,
    build_cmd,
  }: {
    export_build: boolean
    build_cmd: string
  }) => FrameworkInfo
}
export declare const GenericStatic: (
  build_cmd: string,
  found_output_dir: string
) => FrameworkInfo
export declare const FRAMEWORK_NAMES: string[]
