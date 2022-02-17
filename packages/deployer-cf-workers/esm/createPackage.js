import { FabPackageError } from '@fab/cli'
import { log } from './utils'
import path from 'path'
import nanoid from 'nanoid'
import fs from 'fs-extra'
import { extract } from 'zip-lib'
import templateInjections from './templateInjections'
import { pathToSHA512 } from 'file-to-sha512'
export const createPackage = async (
  fab_path,
  package_path,
  config,
  env_overrides,
  assets_url
) => {
  if (!assets_url)
    throw new FabPackageError(
      `Cloudflare Workers requires an assets_url. Use the --assets-url flag.`
    )
  log.time(`Compiling package to: 💛${package_path}💛:`)
  const output_dir = path.dirname(package_path)
  const work_dir = path.join(output_dir, `cf-workers-${nanoid()}`)
  await fs.ensureDir(work_dir)
  log.tick(`Generated working dir in 💛${work_dir}💛.`)
  await extract(fab_path, work_dir)
  log.tick(`Unpacked FAB.`)
  const bundle_id = (await pathToSHA512(fab_path)).slice(0, 32)
  const fab_server_src = await fs.readFile(path.join(work_dir, 'server.js'), 'utf8')
  const injections = templateInjections(fab_server_src, assets_url, env_overrides, {
    bundle_id,
  })
  const template = await fs.readFile(
    path.join(__dirname, '../templates/index.js'),
    'utf8'
  )
  const worker_js = `
    ${injections};
    ${template};
  `
  log.tick(`Generated worker file.`)
  const worker_file = path.join(work_dir, 'worker.js')
  await fs.writeFile(worker_file, worker_js)
  await fs.copyFile(worker_file, package_path)
  log.time(
    (d) => `💚✔💚 Wrote 💛${path.relative(process.cwd(), package_path)}💛 in ${d}.`
  )
}
//# sourceMappingURL=createPackage.js.map
