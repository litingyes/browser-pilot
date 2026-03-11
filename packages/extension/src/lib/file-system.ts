import type { IFsJSON } from './indexeddb'
import { Buffer } from 'node:buffer'
import { Volume } from 'memfs'

export function createFs(fsJson: IFsJSON): Volume {
  const volume = new Volume()
  for (const [path, data] of Object.entries(fsJson)) {
    if (data.type === 'file' && data.content !== undefined) {
      volume.writeFileSync(path, data.content)
    }
    else if (data.type === 'dir') {
      volume.mkdirSync(path, { recursive: true })
    }
  }
  return volume
}

export function fsToJSON(volume: Volume): IFsJSON {
  const result: IFsJSON = {}
  const entries = volume.toJSON() as unknown as Record<string, { type: string, contents?: string | Buffer }>

  for (const [path, data] of Object.entries(entries)) {
    if (path === '/' || path === '')
      continue
    const cleanPath = path.startsWith('/') ? path : `/${path}`

    if (data.type === 'file') {
      let content: string
      if (typeof data.contents === 'string') {
        content = data.contents
      }
      else if (Buffer.isBuffer(data.contents)) {
        content = data.contents.toString('utf-8')
      }
      else {
        content = ''
      }
      result[cleanPath] = { type: 'file', content }
    }
    else {
      result[cleanPath] = { type: 'dir' }
    }
  }

  return result
}

export function createVolume(fsJson: IFsJSON): Volume {
  return createFs(fsJson)
}

export function volumeToJSON(volume: Volume): IFsJSON {
  return fsToJSON(volume)
}

export { Volume } from 'memfs'
