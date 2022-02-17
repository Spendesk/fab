import { IPromptOptions } from 'cli-ux/lib/prompt'
export * from './paths'
export * from './modules'
export * from './watcher'
export declare const confirmAndRespond: (
  log: {
    (str: string): boolean
    _last_time: number
    continue(str: string): void
    time(fn: string | StrFn): void
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
  },
  message: string,
  if_yes?: string,
  if_no?: string
) => Promise<boolean>
declare type StrFn = (d: string) => string
export declare const _log: (
  full_prefix: string
) => {
  (str: string): boolean
  _last_time: number
  continue(str: string): void
  time(fn: string | StrFn): void
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
export declare const log: {
  (str: string): boolean
  _last_time: number
  continue(str: string): void
  time(fn: string | StrFn): void
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
export declare const confirm: (message: string) => Promise<boolean>
export declare const prompt: (
  message: string,
  opts?: IPromptOptions | undefined
) => Promise<any>
export declare type Logger = ReturnType<typeof _log>
