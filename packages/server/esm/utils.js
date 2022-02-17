import yauzl from 'yauzl'
import getStream from 'get-stream'
export async function readFilesFromZip(filename) {
  const files = {}
  await new Promise((resolve, reject) => {
    const promises = []
    yauzl.open(filename, {}, (err, zipfile) => {
      if (err || !zipfile) return reject(err)
      zipfile.on('entry', (entry) => {
        promises.push(
          new Promise((res, rej) => {
            if (entry.fileName.endsWith('/')) return
            zipfile.openReadStream(entry, async (err, stream) => {
              if (err || !stream) return rej(err)
              files[`/${entry.fileName}`] = await getStream.buffer(stream)
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
//# sourceMappingURL=utils.js.map
