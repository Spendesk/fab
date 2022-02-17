import { _log, InvalidConfigError, FabDeployError } from '@fab/cli'
export const log = _log(`@fab/deployer-cf-workers`)
import fetch from 'cross-fetch'
const CF_API_URL = `https://api.cloudflare.com/client/v4`
let ApiInstance = null
export const getCloudflareApi = async (api_token, account_id) => {
  if (ApiInstance) return ApiInstance
  const go = (method, content_type) => async (url, init = {}) => {
    var _a
    const response = await fetch(`${CF_API_URL}${url}`, {
      ...init,
      method,
      headers: {
        authorization: `Bearer ${api_token}`,
        'content-type': content_type,
        ...((_a = init) === null || _a === void 0 ? void 0 : _a.headers),
      },
    })
    return await response.json()
  }
  const get = go('get', 'application/json')
  const put = go('put', 'application/json')
  const post = go('post', 'application/json')
  log(`Checking API token...`)
  const verify = await get(`/user/tokens/verify`)
  if (!verify.success || verify.result.status !== 'active') {
    throw new InvalidConfigError(`Invalid api_token provided!
    Attempting to verify token 💛${api_token}💛 resulted in:
    ❤️${JSON.stringify(verify)}❤️`)
  }
  log.tick(`API token OK. Checking KV access...`)
  const list_namespaces_response = await get(
    `/accounts/${account_id}/storage/kv/namespaces?per_page=100`
  )
  const account_supports_kv = list_namespaces_response.success
  if (!account_supports_kv) {
    const errors = list_namespaces_response.errors
    if (
      (errors && errors.length === 1 && errors[0].code === 10026) ||
      errors[0].code === 10000
    ) {
      log.cross(`The provided Cloudflare Account ID 💛${account_id}💛 does not have KV access.
      See 🖤https://dash.cloudflare.com/${account_id}/workers/kv/namespaces🖤 for more information.`)
    } else {
      throw new FabDeployError(`Error listing namespaces for account 💛${account_id}💛:
      ❤️${JSON.stringify(list_namespaces_response)}❤️`)
    }
  } else {
    log.tick(`KV access confirmed.`)
  }
  async function getOrCreateNamespace(title) {
    const existing_namespace = list_namespaces_response.result.find(
      (r) => r.title === title
    )
    if (existing_namespace) {
      log.tick(`Reusing existing KV namespace 💛${title}💛.`)
      return existing_namespace
    }
    log(`Creating KV namespace 💛${title}💛...`)
    const create_namespace_response = await post(
      `/accounts/${account_id}/storage/kv/namespaces`,
      {
        body: JSON.stringify({ title: title }),
      }
    )
    if (!create_namespace_response.success) {
      throw new FabDeployError(`Error creating namespace 💛${account_id}💛:
        ❤️${JSON.stringify(create_namespace_response)}❤️`)
    }
    log.tick(`Created.`)
    return create_namespace_response.result
  }
  ApiInstance = {
    get,
    put,
    post,
    account_supports_kv,
    getOrCreateNamespace,
  }
  return ApiInstance
}
//# sourceMappingURL=utils.js.map
