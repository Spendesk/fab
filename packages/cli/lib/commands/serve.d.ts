import { Command, flags } from '@oclif/command'
export default class Serve extends Command {
  static description: string
  static examples: string[]
  static flags: {
    help: import('@oclif/parser/lib/flags').IBooleanFlag<void>
    port: flags.IOptionFlag<string>
    cert: flags.IOptionFlag<string | undefined>
    key: flags.IOptionFlag<string | undefined>
    'experimental-v8-sandbox': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    env: flags.IOptionFlag<string | undefined>
    config: flags.IOptionFlag<string>
    'auto-install': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    watch: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    'proxy-ws': flags.IOptionFlag<string | undefined>
  }
  static args: {
    name: string
  }[]
  run(): Promise<void>
}
