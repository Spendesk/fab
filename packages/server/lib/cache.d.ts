import { FabCache, FabCacheValue } from '@fab/core'
export declare class Cache implements FabCache {
  private cache
  constructor()
  set(key: string, value: FabCacheValue, ttl_seconds?: number): Promise<void>
  setJSON(key: string, value: any, ttl_seconds?: number): Promise<void>
  get(key: string): Promise<string | undefined>
  getJSON(key: string): Promise<any>
  getArrayBuffer(key: string): Promise<ArrayBuffer | undefined>
  getNumber(key: string): Promise<number | undefined>
  getStream(key: string): Promise<ReadableStream<any> | undefined>
  private readAllIfStream
}
