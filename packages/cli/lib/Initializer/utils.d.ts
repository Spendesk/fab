import { StringMap } from './constants'
export declare const mergeScriptsAfterBuild: (
  existing_scripts: StringMap,
  framework_scripts: StringMap
) => StringMap
export declare const log: {
  (str: string): boolean
  _last_time: number
  continue(str: string): void
  time(fn: string | ((d: string) => string)): void
  notify(str: string): void
  info(str: string): void
  error(str: string): void
  warn(str: string): void
  note(str: string): void
  tick(str: string, indent?: number): void
  cross(str: string, indent?: number): void
  announce(str: string): void
  confirmAndRespond(
    message: string,
    if_yes?: string | undefined,
    if_no?: string | undefined
  ): Promise<boolean>
  strip(str: string): string
}
