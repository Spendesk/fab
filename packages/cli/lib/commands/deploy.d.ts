import { Command, flags } from '@oclif/command'
export default class Deploy extends Command {
  static description: string
  static examples: string[]
  static flags: {
    help: import('@oclif/parser/lib/flags').IBooleanFlag<void>
    config: flags.IOptionFlag<string>
    'package-dir': flags.IOptionFlag<string | undefined>
    'server-host': flags.IOptionFlag<'cf-workers' | 'aws-lambda-edge' | 'aws-s3'>
    'assets-host': flags.IOptionFlag<'cf-workers' | 'aws-lambda-edge' | 'aws-s3'>
    env: flags.IOptionFlag<string[]>
    'assets-already-deployed-at': flags.IOptionFlag<string | undefined>
    'assets-only': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
    'auto-install': import('@oclif/parser/lib/flags').IBooleanFlag<boolean>
  }
  static args: {
    name: string
  }[]
  run(): Promise<void>
}
