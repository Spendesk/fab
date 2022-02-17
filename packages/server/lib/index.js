'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod
    var result = {}
    if (mod != null)
      for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k]
    result['default'] = mod
    return result
  }
Object.defineProperty(exports, '__esModule', { value: true })
const fs_extra_1 = __importDefault(require('fs-extra'))
const core_1 = require('@fab/core')
const cli_1 = require('@fab/cli')
const utils_1 = require('./utils')
const v8_isolate_1 = __importDefault(require('./sandboxes/v8-isolate'))
const cache_1 = require('./cache')
const sandbox_node_vm_1 = __importDefault(require('@fab/sandbox-node-vm'))
const url_1 = __importDefault(require('url'))
const http_1 = __importDefault(require('http'))
const express_1 = __importDefault(require('express'))
const concat_stream_1 = __importDefault(require('concat-stream'))
const cross_fetch_1 = __importStar(require('cross-fetch'))
const file_to_sha512_1 = require('file-to-sha512')
const stream_1 = __importDefault(require('stream'))
const cli_2 = require('@fab/cli')
const http_proxy_1 = __importDefault(require('http-proxy'))
// @ts-ignore
const readable_stream_node_to_web_1 = __importDefault(
  require('readable-stream-node-to-web')
)
function isRequest(fetch_res) {
  var _a
  return (
    fetch_res instanceof cross_fetch_1.Request ||
    ((_a = fetch_res.constructor) === null || _a === void 0 ? void 0 : _a.name) ===
      'Request'
  )
}
const log = cli_1._log(`Server`)
async function streamResponse(fetch_res, res) {
  res.status(fetch_res.status)
  // This is a NodeFetch response, which has this method, but
  // the @fab/core types are from dom.ts, which doesn't. This
  // was the easiest workaround for now.
  // @ts-ignore
  const response_headers = fetch_res.headers.raw()
  delete response_headers['content-encoding']
  Object.keys(response_headers).forEach((header) => {
    const values = response_headers[header]
    res.set(header, values.length === 1 ? values[0] : values)
  })
  const shouldSetChunkedTransferEncoding =
    !response_headers['content-length'] && !response_headers['transfer-encoding']
  const body = fetch_res.body
  if (body) {
    if (typeof body.getReader === 'function') {
      if (shouldSetChunkedTransferEncoding) res.set('transfer-encoding', 'chunked')
      const reader = body.getReader()
      let x
      while ((x = await reader.read())) {
        const { done, value } = x
        if (done) break
        if (value) {
          if (typeof value === 'string') {
            res.write(value)
          } else {
            res.write(Buffer.from(value))
          }
        }
      }
      res.end()
    } else if (body instanceof stream_1.default) {
      if (!response_headers['transfer-encoding']) res.set('transfer-encoding', 'chunked')
      await new Promise((resolve, reject) => {
        body.on('data', (chunk) => res.write(chunk))
        body.on('error', reject)
        body.on('end', resolve)
      })
      res.end()
    } else {
      const blob = await fetch_res.arrayBuffer()
      res.send(Buffer.from(blob))
    }
  } else {
    res.end()
  }
}
function createEnhancedFetch(port) {
  return async function enchanched_fetch(url, init) {
    const request_url = typeof url === 'string' ? url : url.url
    const fetch_url = request_url.startsWith('/')
      ? // Need a smarter way to re-enter the FAB, eventually...
        `http://localhost:${port}${request_url}`
      : url
    const response = await cross_fetch_1.default(fetch_url, init)
    return Object.create(response, {
      body: {
        value: Object.create(response.body, {
          getReader: {
            get() {
              const webStream = readable_stream_node_to_web_1.default(response.body)
              return webStream.getReader.bind(webStream)
            },
          },
        }),
      },
    })
  }
}
class Server {
  constructor(filename, args) {
    this.filename = filename
    this.port = parseInt(args.port)
    //  TODO: cert stuff
    if (isNaN(this.port)) {
      throw new cli_1.InvalidConfigError(
        `Invalid port, expected a number, got '${args.port}'`
      )
    }
    this.config = args.config
    this.env = args.env
    this.enchanched_fetch = createEnhancedFetch(this.port)
  }
  async createRenderer(src, runtimeType) {
    const renderer =
      (await runtimeType) === core_1.SandboxType.v8isolate
        ? await v8_isolate_1.default(src)
        : await sandbox_node_vm_1.default(src, this.enchanched_fetch)
    const bundle_id = (await file_to_sha512_1.pathToSHA512(this.filename)).slice(0, 32)
    const cache = new cache_1.Cache()
    // Support pre v0.2 FABs
    if (typeof renderer.initialize === 'function') {
      renderer.initialize({ bundle_id, cache })
    }
    return renderer
  }
  async renderReq(renderer, req, settings_overrides) {
    var _a
    const method = req.method
    const headers = req.headers
    const url = `${req.protocol}://${req.headers.host}${req.url}`
    const fetch_req = new cross_fetch_1.Request(url, {
      method,
      headers,
      ...(method === 'POST' || method === 'PUT' || method === 'PATCH'
        ? { body: req.body }
        : {}),
    })
    const production_settings =
      (_a = renderer.metadata) === null || _a === void 0 ? void 0 : _a.production_settings
    let fetch_res
    try {
      fetch_res = await renderer.render(
        // @ts-ignore
        fetch_req,
        Object.assign({}, production_settings, settings_overrides)
      )
    } catch (err) {
      const msg = `An error occurred calling the render method on the FAB: \nError: \n${err}`
      throw new Error(msg)
    }
    try {
      if (fetch_res && isRequest(fetch_res)) {
        fetch_res = await this.enchanched_fetch(fetch_res)
      }
    } catch (err) {
      const msg = `An error occurred proxying a request returned from the FAB: \nError:\n${err}\nRequest:\n${fetch_res}`
      throw new Error(msg)
    }
    if (!fetch_res) {
      const msg = `Nothing was returned from the FAB renderer.`
      throw new Error(msg)
    }
    return fetch_res
  }
  setupExpress(renderer, settings_overrides, files) {
    const app = express_1.default()
    app.use((req, res, next) => {
      try {
        next()
      } catch (err) {
        log(`ERROR serving: ${req.url}`)
        log(err)
        if (!res.headersSent) {
          res.writeHead(500, `Internal Error:\n${err}`)
        }
        res.end()
      }
    })
    app.use((req, _res, next) => {
      req.pipe(
        concat_stream_1.default((data) => {
          req.body = data.toString()
          next()
        })
      )
    })
    app.use((req, _res, next) => {
      log(`🖤${req.url}🖤`)
      next()
    })
    app.get('/_assets/*', (req, res) => {
      const pathname = url_1.default.parse(req.url).pathname
      res.setHeader('Content-Type', core_1.getContentType(pathname))
      res.setHeader('Cache-Control', 'immutable')
      res.end(files[pathname])
    })
    app.all('*', async (req, res) => {
      const fetch_res = await this.renderReq(renderer, req, settings_overrides)
      streamResponse(fetch_res, res)
    })
    return app
  }
  async createHandler(runtimeType) {
    log(`Reading 💛${this.filename}💛...`)
    const files = await utils_1.readFilesFromZip(this.filename)
    const src_buffer = files['/server.js']
    if (!src_buffer) {
      throw new cli_1.FabServerError('Malformed FAB. Missing /server.js')
    }
    const src = src_buffer.toString('utf8')
    log.tick(`Done. Booting VM...`)
    const settings_overrides = await this.getSettingsOverrides()
    const renderer = await this.createRenderer(src, runtimeType)
    log.tick(`Done. Booting FAB server...`)
    return this.setupExpress(renderer, settings_overrides, files)
  }
  async serve(runtimeType, watching = false, proxyWs) {
    if (!(await fs_extra_1.default.pathExists(this.filename))) {
      throw new cli_1.FabServerError(`Could not find file '${this.filename}'`)
    }
    let app
    let proxy
    let server
    const bootServer = async () => {
      app = await this.createHandler(runtimeType)
      await new Promise((resolve, _reject) => {
        if (!server) {
          server = http_1.default.createServer((req, res) => app(req, res))
          if (proxyWs) {
            if (!proxy) {
              proxy = http_proxy_1.default.createProxyServer({
                target: `ws://localhost:${proxyWs}`,
                ws: true,
              })
            }
            //   ? https.createServer({ key: this.key, cert: this.cert }, app)
            server.on('upgrade', (req, socket, head) => {
              proxy.ws(req, socket, head)
            })
          }
          server.listen(this.port, resolve)
        } else {
          resolve()
        }
      })
    }
    if (watching) {
      log.note(`Watching 💛${this.filename}💛 for changes...`)
      await cli_2.watcher([this.filename], bootServer, {
        awaitWriteFinish: {
          stabilityThreshold: 200,
          pollInterval: 50,
        },
      })
    } else {
      await bootServer()
    }
  }
  async getSettingsOverrides() {
    var _a
    if (!this.env) return {}
    const config = await cli_1.JSON5Config.readFrom(this.config)
    const overrides =
      (_a = config.data.settings) === null || _a === void 0 ? void 0 : _a[this.env]
    if (!overrides) {
      throw new cli_1.InvalidConfigError(
        `No environment '${this.env}' found in ${this.config}!`
      )
    }
    return overrides
  }
}
const createServer = (filename, args) => new Server(filename, args)
const serverExports = { createServer }
exports.default = serverExports
//# sourceMappingURL=index.js.map
