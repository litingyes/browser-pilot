import { attachDebugger, sendCdp } from './debugger'

export type StorageType = 'local' | 'session'

interface RuntimeRemoteObject {
  value?: unknown
}

interface RuntimeExceptionDetails {
  text?: string
}

interface RuntimeEvaluateResponse {
  result?: RuntimeRemoteObject
  exceptionDetails?: RuntimeExceptionDetails
}

type StorageData = Record<string, string | null>

interface StorageGetByKeyResult {
  key: string
  value: unknown
}

interface StorageGetAllResult {
  data: StorageData
}

function storageJsName(storageType: StorageType = 'local') {
  return storageType === 'session' ? 'sessionStorage' : 'localStorage'
}

async function prepareStorageRuntime(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Runtime.enable')
}

async function evalSimple(tabId: number, expression: string): Promise<unknown> {
  const result = await sendCdp(tabId, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  if (result.exceptionDetails) {
    throw new Error(`Storage error: ${result.exceptionDetails.text ?? 'Unknown error'}`)
  }

  return result.result?.value ?? null
}

export async function getStorage(
  tabId: number,
  storageType: StorageType = 'local',
  key?: string,
): Promise<StorageGetByKeyResult | StorageGetAllResult> {
  await prepareStorageRuntime(tabId)
  const storage = storageJsName(storageType)

  if (typeof key === 'string') {
    const value = await evalSimple(
      tabId,
      `${storage}.getItem(${JSON.stringify(key)})`,
    )
    return { key, value }
  }

  const data = await evalSimple(
    tabId,
    `(() => {
      const s = ${storage};
      const items = {};
      for (let i = 0; i < s.length; i += 1) {
        const itemKey = s.key(i);
        if (itemKey !== null) {
          items[itemKey] = s.getItem(itemKey);
        }
      }
      return items;
    })()`,
  )

  return { data: (data ?? {}) as StorageData }
}

export async function setStorage(
  tabId: number,
  key: string,
  value: string,
  storageType: StorageType = 'local',
) {
  await prepareStorageRuntime(tabId)
  const storage = storageJsName(storageType)

  await evalSimple(
    tabId,
    `${storage}.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})`,
  )
}

export async function clearStorage(
  tabId: number,
  storageType: StorageType = 'local',
) {
  await prepareStorageRuntime(tabId)
  const storage = storageJsName(storageType)
  await evalSimple(tabId, `${storage}.clear()`)
}
