'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const core_1 = require('@fab/core')
const utils_1 = require('./utils')
const cli_1 = require('@fab/cli')
const createPackage_1 = require('./createPackage')
const path_1 = __importDefault(require('path'))
const fs_extra_1 = __importDefault(require('fs-extra'))
const nanoid_1 = __importDefault(require('nanoid'))
const zip_lib_1 = require('zip-lib')
const globby_1 = __importDefault(require('globby'))
const pretty_bytes_1 = __importDefault(require('pretty-bytes'))
const form_data_1 = __importDefault(require('form-data'))
exports.deployBoth = async (fab_path, package_dir, config, env_overrides) => {
  const assets_url = await exports.deployAssets(fab_path, package_dir, config)
  return await exports.deployServer(
    fab_path,
    package_dir,
    config,
    env_overrides,
    assets_url
  )
}
exports.deployAssets = async (fab_path, package_dir, config) => {
  utils_1.log(`Starting 💛assets💛 deploy...`)
  const { account_id, api_token, script_name } = config
  utils_1.log.tick(`Config valid, checking API token...`)
  const asset_namespace = `FAB assets (${script_name})`
  const extracted_dir = path_1.default.join(
    package_dir,
    `cf-workers-${nanoid_1.default()}`
  )
  await fs_extra_1.default.ensureDir(extracted_dir)
  utils_1.log.tick(`Generated working dir in 💛${extracted_dir}💛.`)
  await zip_lib_1.extract(fab_path, extracted_dir)
  utils_1.log.tick(`Unpacked FAB.`)
  utils_1.log(`Uploading assets to KV store...`)
  const api = await utils_1.getCloudflareApi(api_token, account_id)
  if (!api.account_supports_kv) {
    throw new cli_1.InvalidConfigError(`Cannot deploy assets to Cloudflare Workers without KV store access.
    Use an alternate asset host e.g. AWS S3
    🖤  (see https://fab.dev/guides/deploying for more info)🖤
    or upgrade your Cloudflare account.`)
  }
  const namespace = await api.getOrCreateNamespace(asset_namespace)
  utils_1.log(`Uploading files...`)
  const files = await globby_1.default(['_assets/**/*'], { cwd: extracted_dir })
  const uploads = files.map(async (file) => {
    const content_type = core_1.getContentType(file)
    const body_stream = fs_extra_1.default.createReadStream(
      path_1.default.join(extracted_dir, file)
    )
    const body = new form_data_1.default()
    body.append('metadata', JSON.stringify({ content_type }), {
      contentType: 'application/json',
    })
    body.append('value', body_stream)
    const response = await api.put(
      `/accounts/${account_id}/storage/kv/namespaces/${
        namespace.id
      }/values/${encodeURIComponent(`/${file}`)}`,
      {
        body: body,
        headers: body.getHeaders(),
      }
    )
    if (!response.success) {
      throw new cli_1.FabDeployError(`❤️Error uploading file❤️ 💛${file}💛:
        ${response.errors
          .map((err) => `🖤[error ${err.code}]🖤 ❤️${err.message}❤️`)
          .join('\n')}
      `)
    }
    utils_1.log.continue(
      `🖤  ${file} (${pretty_bytes_1.default(body_stream.bytesRead)})🖤`
    )
  })
  await Promise.all(uploads)
  utils_1.log.tick(`Done.`)
  return `kv://${namespace.id}`
}
exports.deployServer = async (
  fab_path,
  package_dir,
  config,
  env_overrides,
  assets_url
) => {
  const package_path = path_1.default.join(package_dir, 'cf-workers.js')
  utils_1.log(`Starting 💛server💛 deploy...`)
  if (!assets_url) {
    throw new cli_1.FabDeployError(
      `Cloudflare Workers requires an assets_url, while KV is still not supported.`
    )
  }
  const {
    account_id,
    zone_id,
    route,
    routes,
    api_token,
    workers_dev,
    script_name,
  } = config
  if (workers_dev) {
    checkValidityForWorkersDev(config)
  } else {
    checkValidityForZoneRoutes(config, env_overrides)
  }
  const api = await utils_1.getCloudflareApi(api_token, account_id)
  await packageAndUpload(
    fab_path,
    package_path,
    config,
    env_overrides,
    assets_url,
    api,
    account_id,
    script_name
  )
  if (workers_dev) {
    return await publishOnWorkersDev(api, account_id, script_name, env_overrides)
  } else {
    if ('routes' in config) {
      let promises = routes.map((r) => publishOnZoneRoute(api, zone_id, r, script_name))
      return await Promise.all(promises)
    } else {
      return await publishOnZoneRoute(api, zone_id, route, script_name)
    }
  }
}
function checkValidityForWorkersDev(config) {
  const required_keys = ['account_id', 'api_token', 'script_name']
  const missing_config = required_keys.filter((k) => !config[k])
  if (missing_config.length > 0) {
    throw new cli_1.InvalidConfigError(`Missing required keys for @fab/deploy-cf-workers (with 💛workers_dev: true💛):
    ${missing_config.map((k) => `💛• ${k}💛`).join('\n')}`)
  }
  const ignored_keys = ['zone_id', 'route']
  const ignored_config = ignored_keys.filter((k) => config[k])
  if (ignored_config.length > 0) {
    utils_1.log(`💚NOTE:💚 ignoring the following config as deploys with 💛workers_dev: true💛 don't need them:
      ${ignored_config.map((k) => `💛• ${k}: ${config[k]}💛`).join('\n')}`)
  }
  utils_1.log.tick(`Config valid.`)
}
function checkValidityForZoneRoutes(config, env_overrides) {
  const required_keys = [
    'account_id',
    'api_token',
    'script_name',
    'zone_id',
    'route',
    'routes',
  ]
  const missing_config = required_keys.filter((k) => !config[k])
  if (missing_config.length > 0) {
    if (
      !(
        missing_config.length === 1 &&
        (missing_config[0] === 'route' || missing_config[0] === 'routes')
      )
    ) {
      throw new cli_1.InvalidConfigError(`Missing required keys for @fab/deploy-cf-workers (with 💛workers_dev: false💛):
        ${missing_config.map((k) => `💛• ${k}💛`).join('\n')}`)
    }
  }
  if ('routes' in config && 'route' in config) {
    throw new cli_1.InvalidConfigError(
      'You can have either `routes` or `route` in config for @fab/deploy-cf-workers'
    )
  }
  if ('routes' in config) {
    let routes = config['routes']
    if (!Array.isArray(routes)) {
      throw new cli_1.InvalidConfigError(
        'value for `routes` key of @fab/deploy-cf-workers config should be an Array'
      )
    }
    if ([...new Set(routes)].length !== routes.length) {
      throw new cli_1.InvalidConfigError(
        'Duplicate item in value for `routes` key of @fab/deploy-cf-workers config'
      )
    }
  }
  if (Array.from(env_overrides.keys()).length > 1) {
    throw new cli_1.InvalidConfigError(
      `Deploy with multiple env on route not supported yet`
    )
  }
  utils_1.log.tick(`Config valid.`)
}
async function packageAndUpload(
  fab_path,
  package_path,
  config,
  env_overrides,
  assets_url,
  api,
  account_id,
  script_name
) {
  await createPackage_1.createPackage(
    fab_path,
    package_path,
    config,
    env_overrides,
    assets_url
  )
  const bindings = config.custom_bindings || []
  if (api.account_supports_kv) {
    const cache_namespace = `FAB cache (${script_name})`
    const namespace = await api.getOrCreateNamespace(cache_namespace)
    bindings.push({
      type: 'kv_namespace',
      name: 'KV_FAB_CACHE',
      namespace_id: namespace.id,
    })
  } else {
    utils_1.log.note(`Cloudflare KV support required for caching.
    Your FAB will not break but no caching will be possible between requests.
    See 🖤https://fab.dev/kb/caching🖤 for more information.`)
  }
  utils_1.log.time(`Uploading script...`)
  const assets_in_kv = assets_url.match(/kv:\/\/(\w+)/)
  if (assets_in_kv) {
    const [_, namespace_id] = assets_in_kv
    bindings.push({
      type: 'kv_namespace',
      name: 'KV_FAB_ASSETS',
      namespace_id,
    })
  }
  let service_response = await api.get(
    `/accounts/${account_id}/workers/services/${script_name}`
  )
  if (!service_response.success) {
    const body = new form_data_1.default()
    body.append('metadata', JSON.stringify({ body_part: 'script', bindings }))
    body.append('script', await fs_extra_1.default.readFile(package_path, 'utf8'), {
      contentType: 'application/javascript',
    })
    const upload_response = await api.put(
      `/accounts/${account_id}/workers/scripts/${script_name}`,
      {
        body: body,
        headers: body.getHeaders(),
      }
    )
    if (!upload_response.success) {
      throw new cli_1.FabDeployError(`Error uploading the script, got response:
      ❤️${JSON.stringify(upload_response)}❤️`)
    }
    service_response = await api.get(
      `/accounts/${account_id}/workers/services/${script_name}`
    )
    if (!service_response.success) {
      throw new cli_1.FabDeployError(`Error getting the service, got response:
      ❤️${JSON.stringify(upload_response)}❤️`)
    }
  }
  const environments = service_response.result.environments.map(
    ({ environment }) => environment
  )
  for (const [env] of env_overrides) {
    if (!environments.includes(env)) {
      const create_environement_response = await api.post(
        `/accounts/${account_id}/workers/services/${script_name}/environments/production/copy/${env}`
      )
      if (!create_environement_response.success) {
        throw new cli_1.FabDeployError(`Error creating the environment, got response:
          ❤️${JSON.stringify(create_environement_response)}❤️`)
      }
    }
    const body = new form_data_1.default()
    body.append(
      'metadata',
      JSON.stringify({
        body_part: 'script',
        bindings: [...bindings, { type: 'plain_text', name: 'ENVIRONMENT', text: env }],
      })
    )
    body.append('script', await fs_extra_1.default.readFile(package_path, 'utf8'), {
      contentType: 'application/javascript',
    })
    const upload_response = await api.put(
      `/accounts/${account_id}/workers/services/${script_name}/environments/${env}`,
      {
        body: body,
        headers: body.getHeaders(),
      }
    )
    if (!upload_response) {
      throw new cli_1.FabDeployError(`Error uploading the service, got response:
        ❤️${JSON.stringify(upload_response)}❤️`)
    }
  }
  utils_1.log.tick(`Uploaded, publishing...`)
}
async function publishOnWorkersDev(api, account_id, script_name, env_overrides) {
  const subdomain_response = await api.get(`/accounts/${account_id}/workers/subdomain`)
  if (!subdomain_response.success) {
    throw new cli_1.FabDeployError(`Error getting your workers.dev subdomain:
      ❤️${JSON.stringify(subdomain_response)}❤️`)
  }
  const { subdomain } = subdomain_response.result
  const urls = []
  for (const [env] of env_overrides) {
    const publish_response = await api.post(
      `/accounts/${account_id}/workers/services/${script_name}/environments/${env}/subdomain`,
      {
        body: JSON.stringify({ enabled: true }),
      }
    )
    if (!publish_response.success) {
      throw new cli_1.FabDeployError(`Error publishing the script on a workers.dev subdomain, got response:
        ❤️${JSON.stringify(publish_response)}❤️`)
    }
    urls.push(`https://${env}.${script_name}.${subdomain}.workers.dev`)
  }
  utils_1.log.tick(`Done.`)
  utils_1.log.time((d) => `Deployed in ${d}.`)
  return urls
}
async function publishOnZoneRoute(api, zone_id, route, script_name) {
  const list_routes_response = await api.get(`/zones/${zone_id}/workers/routes`)
  if (!list_routes_response.success) {
    throw new cli_1.FabDeployError(`Error listing routes on zone 💛${zone_id}💛:
      ❤️${JSON.stringify(list_routes_response)}❤️`)
  }
  const existing_route = list_routes_response.result.find((r) => r.pattern === route)
  if (existing_route) {
    const { id, script } = existing_route
    if (script === script_name) {
      utils_1.log(
        `💚Route already exists!💚: pattern 💛${route}💛 already points at script 💛${script_name}💛`
      )
    } else {
      utils_1.log(`Found existing route id 💛${id}💛, updating...`)
      const update_route_response = await api.put(
        `/zones/${zone_id}/workers/routes/${id}`,
        {
          body: JSON.stringify({ pattern: route, script: script_name }),
        }
      )
      if (!update_route_response.success) {
        throw new cli_1.FabDeployError(`Error publishing to route 💛${route}💛 on zone 💛${zone_id}💛:
        ❤️${JSON.stringify(update_route_response)}❤️`)
      }
    }
  } else {
    utils_1.log(
      `No existing route found for 💛${route}💛, creating one to point to script 💛${script_name}💛`
    )
    const create_route_response = await api.post(`/zones/${zone_id}/workers/routes`, {
      body: JSON.stringify({ pattern: route, script: script_name }),
    })
    if (!create_route_response.success) {
      throw new cli_1.FabDeployError(`Error publishing to route 💛${route}💛 on zone 💛${zone_id}💛:
      ❤️${JSON.stringify(create_route_response)}❤️`)
    }
  }
  utils_1.log.tick(`Done.`)
  utils_1.log.time((d) => `Deployed in ${d}.`)
  return new URL(route).origin
}
//# sourceMappingURL=deploy.js.map
