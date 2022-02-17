export declare const DEFAULT_DEPS: string[]
export declare const DEPRECATED_PACKAGES: string[]
export declare const GITIGNORE_LINES: string[]
export declare const GUESSED_OUTPUT_DIRS: string[]
export declare const OUTPUT_DIR_EXAMPLES: string
export declare const BASE_CONFIG: string
export declare type StringMap = {
  [key: string]: string
}
export declare type PackageJson = {
  scripts?: StringMap
  dependencies?: StringMap
  devDependencies?: StringMap
}
