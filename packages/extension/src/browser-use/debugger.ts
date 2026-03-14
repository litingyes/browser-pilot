import { ensureTabState, getTabState, updateTabState } from './state'

const DEBUGGER_VERSION = '1.3'

function asMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
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
      if (browser.runtime.lastError) {
        reject(new Error(browser.runtime.lastError.message))
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
  await ensureTabExists(tabId)
  if (!getTabState(tabId)?.attached) {
    await attachDebugger(tabId)
  }

  try {
    return await executeSendCommand(tabId, method, params)
  }
  catch (error) {
    const message = asMessage(error)
    if (!message.includes('Debugger is not attached to the tab with id')) {
      throw error
    }

    updateTabState(tabId, { attached: false })
    await attachDebugger(tabId)
    return await executeSendCommand(tabId, method, params)
  }
}
