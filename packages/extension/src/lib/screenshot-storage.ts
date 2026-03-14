import type { ScreenshotRecord } from './indexeddb'
import { db } from './indexeddb'

const SCREENSHOT_VIRTUAL_PATH_PREFIX = 'screenshot://'
const SCREENSHOT_TTL_MS = 24 * 60 * 60 * 1000
const SCREENSHOT_MAX_ITEMS = 120
const SCREENSHOT_MAX_TOTAL_BYTES = 100 * 1024 * 1024

export type ScreenshotDataMode = 'base64' | 'dataUrl'

export interface SaveScreenshotInput {
  tabId: number
  mimeType: string
  base64Data: string
  path: string
  width?: number
  height?: number
}

export interface StoredScreenshotMeta {
  screenshotId: string
  virtualPath: string
  createdAt: number
  tabId: number
  path: string
  mimeType: string
  bytes: number
  width?: number
  height?: number
}

function toVirtualPath(screenshotId: string) {
  return `${SCREENSHOT_VIRTUAL_PATH_PREFIX}${screenshotId}`
}

function toBase64FromBytes(bytes: Uint8Array): string {
  const chunkSize = 0x8000
  let binary = ''
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }
  return btoa(binary)
}

function fromBase64ToArrayBuffer(base64Data: string): ArrayBuffer {
  const binary = atob(base64Data)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return bytes.buffer
}

function toMeta(record: ScreenshotRecord | undefined): StoredScreenshotMeta | null {
  if (!record) {
    return null
  }

  return {
    bytes: record.bytes,
    createdAt: record.createdAt,
    height: record.height,
    mimeType: record.mimeType,
    path: record.path,
    screenshotId: record.id,
    tabId: record.tabId,
    virtualPath: toVirtualPath(record.id),
    width: record.width,
  }
}

export function parseScreenshotIdFromVirtualPath(input: string) {
  if (!input.startsWith(SCREENSHOT_VIRTUAL_PATH_PREFIX)) {
    return null
  }
  const screenshotId = input.slice(SCREENSHOT_VIRTUAL_PATH_PREFIX.length).trim()
  return screenshotId.length > 0 ? screenshotId : null
}

export async function cleanupStoredScreenshots() {
  const records = await db.screenshots.orderBy('createdAt').toArray()
  const now = Date.now()

  let totalBytes = records.reduce((sum, record) => sum + record.bytes, 0)
  const removable = [...records]
  const toDelete = new Set<string>()

  for (const record of removable) {
    if (now - record.createdAt <= SCREENSHOT_TTL_MS) {
      continue
    }
    toDelete.add(record.id)
    totalBytes -= record.bytes
  }

  const retained = removable.filter(record => !toDelete.has(record.id))
  while (retained.length > SCREENSHOT_MAX_ITEMS || totalBytes > SCREENSHOT_MAX_TOTAL_BYTES) {
    const oldest = retained.shift()
    if (!oldest) {
      break
    }
    toDelete.add(oldest.id)
    totalBytes -= oldest.bytes
  }

  if (toDelete.size > 0) {
    await db.screenshots.bulkDelete([...toDelete])
  }
}

export async function saveScreenshotToStore(input: SaveScreenshotInput): Promise<StoredScreenshotMeta> {
  const screenshotId = crypto.randomUUID()
  const createdAt = Date.now()
  const arrayBuffer = fromBase64ToArrayBuffer(input.base64Data)
  const blob = new Blob([arrayBuffer], { type: input.mimeType })

  await db.screenshots.put({
    blob,
    bytes: blob.size,
    createdAt,
    height: input.height,
    id: screenshotId,
    mimeType: input.mimeType,
    path: input.path,
    tabId: input.tabId,
    width: input.width,
  })

  await cleanupStoredScreenshots()

  return {
    bytes: blob.size,
    createdAt,
    height: input.height,
    mimeType: input.mimeType,
    path: input.path,
    screenshotId,
    tabId: input.tabId,
    virtualPath: toVirtualPath(screenshotId),
    width: input.width,
  }
}

export async function getScreenshotMetaById(screenshotId: string) {
  const record = await db.screenshots.get(screenshotId)
  return toMeta(record)
}

export async function getScreenshotMetaByVirtualPath(virtualPath: string) {
  const screenshotId = parseScreenshotIdFromVirtualPath(virtualPath)
  if (!screenshotId) {
    return null
  }
  return getScreenshotMetaById(screenshotId)
}

export async function getScreenshotBlobUrlById(screenshotId: string) {
  const record = await db.screenshots.get(screenshotId)
  if (!record) {
    throw new Error(`Screenshot not found: ${screenshotId}`)
  }
  return URL.createObjectURL(record.blob)
}

export async function getScreenshotBlobUrlByVirtualPath(virtualPath: string) {
  const screenshotId = parseScreenshotIdFromVirtualPath(virtualPath)
  if (!screenshotId) {
    throw new Error(`Invalid screenshot virtual path: ${virtualPath}`)
  }
  return getScreenshotBlobUrlById(screenshotId)
}

export async function getScreenshotDataById(
  screenshotId: string,
  mode: ScreenshotDataMode = 'base64',
) {
  const record = await db.screenshots.get(screenshotId)
  if (!record) {
    throw new Error(`Screenshot not found: ${screenshotId}`)
  }

  const bytes = new Uint8Array(await record.blob.arrayBuffer())
  const base64 = toBase64FromBytes(bytes)

  if (mode === 'dataUrl') {
    return `data:${record.mimeType};base64,${base64}`
  }
  return base64
}

export async function deleteScreenshotById(screenshotId: string) {
  await db.screenshots.delete(screenshotId)
  return { deleted: true, screenshotId }
}

export { SCREENSHOT_VIRTUAL_PATH_PREFIX }
