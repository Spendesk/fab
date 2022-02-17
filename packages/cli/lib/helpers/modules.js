'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const path_1 = __importDefault(require('path'))
const execa_1 = __importDefault(require('execa'))
const resolve_1 = __importDefault(require('resolve'))
function useYarn(root_dir) {
  return fs_extra_1.default.pathExists(path_1.default.join(root_dir, 'yarn.lock'))
}
exports.useYarn = useYarn
function tryLoading(module_name) {
  return require(resolve_1.default.sync(module_name, { basedir: process.cwd() }))
}
function loadModule(log, module_name) {
  try {
    return tryLoading(module_name)
  } catch (e) {
    log.error(`ERROR: FAILED TO LOAD ${module_name}.`)
    throw e
  }
}
exports.loadModule = loadModule
async function tryLoadingMultiple(module_names) {
  const attempts = {}
  await Promise.all(
    module_names.map(async (name) => {
      try {
        const module = tryLoading(name)
        attempts[name] = { module }
      } catch (error) {
        attempts[name] = { error }
      }
    })
  )
  return attempts
}
async function loadOrInstallModules(log, module_names, auto_install) {
  const root_dir = process.cwd()
  const first_attempt = await tryLoadingMultiple(module_names)
  const missing_modules = module_names.filter((name) => first_attempt[name].error)
  if (missing_modules.length === 0) {
    return module_names.map((name) => first_attempt[name].module)
  }
  const use_yarn = await useYarn(root_dir)
  log(`${
    auto_install
      ? `💚NOTE💚: Installing required modules due to 💛--auto-install💛 flag:`
      : `❤️WARNING❤️: Missing required modules:`
  }
  ${missing_modules.map((name) => `💛${name}💛`).join('\n')}`)
  const proceed = auto_install
    ? log(`using 💛${use_yarn ? 'yarn' : 'npm'}💛.`)
    : await log.confirmAndRespond(
        `Would you like to install them using 💛${use_yarn ? 'yarn' : 'npm'}💛?`
      )
  if (!proceed) {
    log.error(`Cannot continue without these modules`)
    throw first_attempt[missing_modules[0]].error
  }
  await installDependencies(use_yarn, missing_modules, root_dir)
  const second_attempt = await tryLoadingMultiple(missing_modules)
  const still_missing = missing_modules.filter((name) => second_attempt[name].error)
  if (still_missing.length > 0) {
    log.error(`Still cannot resolve these modules: ${still_missing.join(',')}`)
    throw second_attempt[still_missing[0]].error
  }
  return module_names.map(
    (name) => second_attempt[name].module || first_attempt[name].module
  )
}
exports.loadOrInstallModules = loadOrInstallModules
async function loadOrInstallModule(log, module_name, auto_install) {
  return (await loadOrInstallModules(log, [module_name], auto_install))[0]
}
exports.loadOrInstallModule = loadOrInstallModule
async function installDependencies(use_yarn, dependencies, root_dir) {
  var _a, _b
  const install_process = use_yarn
    ? execa_1.default('yarn', ['add', '--dev', ...dependencies], { cwd: root_dir })
    : execa_1.default('npm', ['i', '--save-dev', ...dependencies], { cwd: root_dir })
  ;(_a = install_process.stdout) === null || _a === void 0
    ? void 0
    : _a.pipe(process.stdout)
  ;(_b = install_process.stderr) === null || _b === void 0
    ? void 0
    : _b.pipe(process.stderr)
  await install_process
}
exports.installDependencies = installDependencies
//# sourceMappingURL=modules.js.map
