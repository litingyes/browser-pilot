import { ensureTabState, getTabState, updateTabState } from './state'

const DEBUGGER_VERSION = '1.3'
const DETACHED_ERROR_PATTERNS = [
  'Debugger is not attached to the tab with id',
  'No target with given id found',
  'target closed',
  'Cannot access a chrome:// URL',
]
let detachListenerRegistered = false

function asMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function normalizeMessage(message: string) {
  return message.toLowerCase()
}

function isDetachLikeError(error: unknown) {
  const message = normalizeMessage(asMessage(error))
  return DETACHED_ERROR_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))
}

function registerDetachListener() {
  if (detachListenerRegistered) {
    return
  }

  browser.debugger.onDetach.addListener((source) => {
    const tabId = source.tabId
    if (!Number.isInteger(tabId)) {
      return
    }
    updateTabState(tabId!, { attached: false })
  })

  detachListenerRegistered = true
}

async function ensureTabExists(tabId: number) {
  try {
    await browser.tabs.get(tabId)
  }
  catch {
    updateTabState(tabId, { attached: false })
    throw new Error(`Tab ${tabId} does not exist`)
  }
}

async function executeSendCommand(tabId: number, method: string, params?: Record<string, unknown>) {
  return await new Promise((resolve, reject) => {
    browser.debugger.sendCommand({ tabId }, method, params, (result) => {
      if (browser.runtime.lastError) {
        reject(new Error(`${method} failed: ${browser.runtime.lastError.message}`))
        return
      }
      resolve(result || {})
    })
  })
}

export async function attachDebugger(tabId: number) {
  registerDetachListener()
  await ensureTabExists(tabId)
  const currentState = getTabState(tabId)
  if (currentState?.attached) {
    return
  }

  const tabState = ensureTabState(tabId)
  if (tabState.attached) {
    return
  }

  await new Promise((resolve, reject) => {
    browser.debugger.attach({ tabId }, DEBUGGER_VERSION, () => {
      const lastError = browser.runtime.lastError
      if (lastError) {
        const message = lastError.message
        // Tab can already be attached after extension hot reload or races.
        if (typeof message === 'string' && message.toLowerCase().includes('already attached')) {
          resolve(true)
          return
        }
        reject(new Error(message))
        return
      }
      resolve(true)
    })
  })
  tabState.attached = true

  await executeSendCommand(tabId, 'Accessibility.enable')
}

export async function detachDebugger(tabId: number) {
  updateTabState(tabId, { attached: false })

  await new Promise<void>((resolve) => {
    browser.debugger.detach({ tabId }, () => {
      resolve()
    })
  })
}

export async function sendCdp(tabId: number, method: string, params?: Record<string, unknown>) {
  registerDetachListener()
  await ensureTabExists(tabId)
  if (!getTabState(tabId)?.attached) {
    await attachDebugger(tabId)
  }

  try {
    return await executeSendCommand(tabId, method, params)
  }
  catch (error) {
    if (!isDetachLikeError(error)) {
      throw error
    }

    updateTabState(tabId, { attached: false })
    await attachDebugger(tabId)
    return await executeSendCommand(tabId, method, params)
  }
}
