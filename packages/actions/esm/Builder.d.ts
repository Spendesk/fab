import { LoadedPlugin, FabConfig } from '@fab/core'
export default class Builder {
  static build(
    config_path: string,
    config: FabConfig,
    skip_cache?: boolean,
    skip_typecheck?: boolean,
    minify?: boolean
  ): Promise<void>
  static getPlugins(config_path: string, config: FabConfig): Promise<LoadedPlugin[]>
}
