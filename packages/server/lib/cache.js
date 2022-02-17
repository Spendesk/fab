'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const node_cache_1 = __importDefault(require('node-cache'))
const stream_1 = __importDefault(require('stream'))
/* We need something that node-fetch Response treats as a stream */
const sandbox_node_vm_1 = require('@fab/sandbox-node-vm')
// @ts-ignore
const HybridReadableStream = sandbox_node_vm_1.HybridReadableStream
class Cache {
  constructor() {
    this.cache = new node_cache_1.default()
  }
  async set(key, value, ttl_seconds) {
    this.cache.set(
      key,
      await this.readAllIfStream(value),
      ttl_seconds || 0 /* unlimited */
    )
  }
  async setJSON(key, value, ttl_seconds) {
    await this.set(key, JSON.stringify(value), ttl_seconds)
  }
  async get(key) {
    return this.cache.get(key)
  }
  async getJSON(key) {
    const val = await this.get(key)
    return val && JSON.parse(val)
  }
  async getArrayBuffer(key) {
    return this.cache.get(key)
  }
  async getNumber(key) {
    return this.cache.get(key)
  }
  async getStream(key) {
    const buffer = this.cache.get(key)
    if (!buffer) return undefined
    return new HybridReadableStream({
      async pull(controller) {
        controller.enqueue(buffer)
        controller.close()
      },
    })
  }
  async readAllIfStream(value) {
    if (typeof value.getReader === 'function') {
      const reader = value.getReader()
      let chunk = await reader.read()
      let buffer = Buffer.from([])
      const enc = new TextEncoder()
      while (!chunk.done) {
        buffer = Buffer.concat([buffer, enc.encode(chunk.value)])
        chunk = await reader.read()
      }
      return buffer
    } else if (value instanceof stream_1.default) {
      const chunks = []
      return await new Promise((resolve, reject) => {
        value.on('data', (chunk) => chunks.push(chunk))
        value.on('error', reject)
        value.on('end', () => resolve(Buffer.concat(chunks)))
      })
    }
    return value
  }
}
exports.Cache = Cache
//# sourceMappingURL=cache.js.map
