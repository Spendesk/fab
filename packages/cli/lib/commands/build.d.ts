import { Command, flags } from '@oclif/command'
export default class Build extends Command {
  static description: string
  static examples: string[]
  static flags: {
    help: import('@oclif/parser/lib/flags').IBooleanFlag<void>
    config: flags.IOptionFlag<string>
    'skip-cache': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    watch: flags.IOptionFlag<string[]>
    'skip-typecheck': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    minify: import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
  }
  static args: never[]
  run(): Promise<void>
}
