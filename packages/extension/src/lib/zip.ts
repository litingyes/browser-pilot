import type { IFsJSON } from './indexeddb'
import { BlobReader, BlobWriter, ZipReader } from '@zip.js/zip.js'

export async function unzip(arrayBuffer: ArrayBuffer): Promise<IFsJSON> {
  const files: IFsJSON = {}
  const blobReader = new BlobReader(new Blob([arrayBuffer]))
  const zipReader = new ZipReader(blobReader)

  const entries = await zipReader.getEntries()

  for (const entry of entries) {
    if (entry.directory) {
      files[entry.filename] = { type: 'dir', mode: entry.uncompressedSize }
    }
    else {
      const content = await entry.getData(new BlobWriter('text/plain'))
      const text = await content.text()
      files[entry.filename] = { type: 'file', content: text, mode: entry.uncompressedSize }
    }
  }

  await zipReader.close()
  return files
}
