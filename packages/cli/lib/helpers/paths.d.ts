export declare const isRelative: (plugin_name: string) => RegExpMatchArray | null
export declare const relativeToConfig: (
  config_path: string,
  relative_path: string,
  might_be_npm_package?: boolean
) => string
