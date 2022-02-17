import { FabConfig, ProtoFab, RuntimePlugin } from '@fab/core'
export declare class Compiler {
  static compile(
    config: FabConfig,
    proto_fab: ProtoFab,
    plugins: RuntimePlugin[],
    minify?: boolean
  ): Promise<void>
}
