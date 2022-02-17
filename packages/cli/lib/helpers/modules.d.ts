import { Logger } from './index'
export declare function useYarn(root_dir: string): Promise<boolean>
export declare function loadModule(log: Logger, module_name: string): any
export declare function loadOrInstallModules(
  log: Logger,
  module_names: string[],
  auto_install: boolean
): Promise<any[]>
export declare function loadOrInstallModule(
  log: Logger,
  module_name: string,
  auto_install: boolean
): Promise<any>
export declare function installDependencies(
  use_yarn: boolean,
  dependencies: string[],
  root_dir: string
): Promise<void>
