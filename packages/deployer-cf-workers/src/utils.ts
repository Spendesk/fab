import { _log, InvalidConfigError, FabDeployError } from '@dev-spendesk/cli'
export const log = _log(`@dev-spendesk/deployer-cf-workers`)

import fetch from 'cross-fetch'

const CF_API_URL = `https://api.cloudflare.com/client/v4`

export type CloudflareApiCall = (url: string, init?: RequestInit) => Promise<any>

type Namespace = {
  title: string
  id: string
}
export type CloudflareApi = {
  post: CloudflareApiCall
  get: CloudflareApiCall
  put: CloudflareApiCall
  account_supports_kv: boolean
  getOrCreateNamespace: (title: string) => Promise<Namespace>
}

let ApiInstance: CloudflareApi | null = null

export const getCloudflareApi = async (
  api_token: string,
  account_id: string
): Promise<CloudflareApi> => {
  if (ApiInstance) return ApiInstance

  const go = (method: string, content_type: string) => async (
    url: string,
    init: RequestInit = {}
  ) => {
    const response = await fetch(`${CF_API_URL}${url}`, {
      ...init,
      method,
      headers: {
        authorization: `Bearer ${api_token}`,
        'content-type': content_type,
        ...init?.headers,
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

  async function getOrCreateNamespace(title: string) {
    const existing_namespace = list_namespaces_response.result.find(
      (r: Namespace) => r.title === title
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
