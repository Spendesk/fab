'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const yauzl_1 = __importDefault(require('yauzl'))
const get_stream_1 = __importDefault(require('get-stream'))
async function readFilesFromZip(filename) {
  const files = {}
  await new Promise((resolve, reject) => {
    const promises = []
    yauzl_1.default.open(filename, {}, (err, zipfile) => {
      if (err || !zipfile) return reject(err)
      zipfile.on('entry', (entry) => {
        promises.push(
          new Promise((res, rej) => {
            if (entry.fileName.endsWith('/')) return
            zipfile.openReadStream(entry, async (err, stream) => {
              if (err || !stream) return rej(err)
              files[`/${entry.fileName}`] = await get_stream_1.default.buffer(stream)
              res()
            })
          })
        )
      })
      zipfile.once('end', () => Promise.all(promises).then(resolve, reject))
    })
  })
  return files
}
exports.readFilesFromZip = readFilesFromZip
//# sourceMappingURL=utils.js.map
