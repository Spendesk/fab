/// <reference types="node" />
export * from './BuildFailed'
export * from './InvalidConfig'
export * from './InvalidPlugin'
export * from './MissingConfig'
export declare const FabInitError: {
  new (message: string): {
    name: string
    message: string
    stack?: string | undefined
  }
  captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void
  prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined
  stackTraceLimit: number
}
export declare const FabDeployError: {
  new (message: string): {
    name: string
    message: string
    stack?: string | undefined
  }
  captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void
  prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined
  stackTraceLimit: number
}
export declare const FabPackageError: {
  new (message: string): {
    name: string
    message: string
    stack?: string | undefined
  }
  captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void
  prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined
  stackTraceLimit: number
}
export declare const FabServerError: {
  new (message: string): {
    name: string
    message: string
    stack?: string | undefined
  }
  captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void
  prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined
  stackTraceLimit: number
}
