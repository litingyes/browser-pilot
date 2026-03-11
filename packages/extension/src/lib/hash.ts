import type { IFsJSON } from './indexeddb'

export async function computeHash(files: IFsJSON): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(JSON.stringify(files)),
  )
  const hashArray = [...new Uint8Array(hashBuffer)]
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
