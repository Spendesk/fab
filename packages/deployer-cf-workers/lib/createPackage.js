'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const cli_1 = require('@fab/cli')
const utils_1 = require('./utils')
const path_1 = __importDefault(require('path'))
const nanoid_1 = __importDefault(require('nanoid'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const zip_lib_1 = require('zip-lib')
const templateInjections_1 = __importDefault(require('./templateInjections'))
const file_to_sha512_1 = require('file-to-sha512')
exports.createPackage = async (
  fab_path,
  package_path,
  config,
  env_overrides,
  assets_url
) => {
  if (!assets_url)
    throw new cli_1.FabPackageError(
      `Cloudflare Workers requires an assets_url. Use the --assets-url flag.`
    )
  utils_1.log.time(`Compiling package to: 💛${package_path}💛:`)
  const output_dir = path_1.default.dirname(package_path)
  const work_dir = path_1.default.join(output_dir, `cf-workers-${nanoid_1.default()}`)
  await fs_extra_1.default.ensureDir(work_dir)
  utils_1.log.tick(`Generated working dir in 💛${work_dir}💛.`)
  await zip_lib_1.extract(fab_path, work_dir)
  utils_1.log.tick(`Unpacked FAB.`)
  const bundle_id = (await file_to_sha512_1.pathToSHA512(fab_path)).slice(0, 32)
  const fab_server_src = await fs_extra_1.default.readFile(
    path_1.default.join(work_dir, 'server.js'),
    'utf8'
  )
  const injections = templateInjections_1.default(
    fab_server_src,
    assets_url,
    env_overrides,
    {
      bundle_id,
    }
  )
  const template = await fs_extra_1.default.readFile(
    path_1.default.join(__dirname, '../templates/index.js'),
    'utf8'
  )
  const worker_js = `
    ${injections};
    ${template};
  `
  utils_1.log.tick(`Generated worker file.`)
  const worker_file = path_1.default.join(work_dir, 'worker.js')
  await fs_extra_1.default.writeFile(worker_file, worker_js)
  await fs_extra_1.default.copyFile(worker_file, package_path)
  utils_1.log.time(
    (d) =>
      `💚✔💚 Wrote 💛${path_1.default.relative(process.cwd(), package_path)}💛 in ${d}.`
  )
}
//# sourceMappingURL=createPackage.js.map
