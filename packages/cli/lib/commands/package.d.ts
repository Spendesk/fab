import { Command, flags } from '@oclif/command'
export default class Deploy extends Command {
  static description: string
  static examples: string[]
  static flags: {
    help: import('@oclif/parser/lib/flags').IBooleanFlag<void>
    config: flags.IOptionFlag<string>
    target: flags.IOptionFlag<'cf-workers' | 'aws-lambda-edge' | 'aws-s3'>
    'output-path': flags.IOptionFlag<string | undefined>
    'assets-url': flags.IOptionFlag<string | undefined>
    env: flags.IOptionFlag<string | undefined>
  }
  static args: {
    name: string
  }[]
  run(): Promise<void>
}
