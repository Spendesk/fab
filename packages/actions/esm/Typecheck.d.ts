import { RuntimePlugin } from '@fab/core'
export declare class Typecheck {
  static startTypecheck(
    config_path: string,
    plugins: RuntimePlugin[],
    skip_typecheck: boolean
  ): Typecheck
  promise: Promise<any> | undefined
  constructor(cwd: string, plugins: string[])
  waitForResults(): Promise<void>
  static Noop: Typecheck
}
