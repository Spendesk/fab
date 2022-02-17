import { FabConfig, JSON5ConfigI } from '@fab/core'
export default class JSON5Config implements JSON5ConfigI {
  str_contents: string
  data: FabConfig
  static readFrom(file_path: string): Promise<JSON5Config>
  static generate(data: string): JSON5Config
  constructor(str_contents: string, data: FabConfig)
  write(file_path: string): Promise<void>
}
