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
export declare type CloudflareApiCall = (url: string, init?: RequestInit) => Promise<any>
declare type Namespace = {
  title: string
  id: string
}
export declare type CloudflareApi = {
  post: CloudflareApiCall
  get: CloudflareApiCall
  put: CloudflareApiCall
  account_supports_kv: boolean
  getOrCreateNamespace: (title: string) => Promise<Namespace>
}
export declare const getCloudflareApi: (
  api_token: string,
  account_id: string
) => Promise<CloudflareApi>
export {}
