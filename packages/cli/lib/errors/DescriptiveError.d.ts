/// <reference types="node" />
export declare const createDescriptiveErrorClass: (
  error_name: string
) => {
  new (message: string): {
    name: string
    message: string
    stack?: string | undefined
  }
  captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void
  prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined
  stackTraceLimit: number
}
