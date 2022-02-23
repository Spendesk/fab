import { FabActionsExports } from '@dev-spendesk/core'
import Packager from './Packager'
import Deployer from './Deployer'
import Builder from './Builder'

const Actions: FabActionsExports = {
  Packager,
  Deployer,
  Builder,
}

export default Actions
