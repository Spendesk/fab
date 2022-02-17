import { OutputOptions, RollupOptions } from 'rollup'
export declare function rollupCompile(
  input: string,
  options?: {
    output?: OutputOptions
    hypotheticals?: {}
    minify?: boolean
    additional?: RollupOptions
  }
): Promise<import('rollup').RollupOutput>
