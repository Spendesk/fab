import { Command, flags } from '@oclif/command'
export default class Init extends Command {
  static description: string
  static examples: string[]
  static flags: {
    help: import('@oclif/parser/lib/flags').IBooleanFlag<void>
    config: flags.IOptionFlag<string>
    yes: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    'skip-install': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    version: flags.IOptionFlag<string | undefined>
    'skip-framework-detection': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    empty: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
  }
  static args: never[]
  run(): Promise<void>
}
