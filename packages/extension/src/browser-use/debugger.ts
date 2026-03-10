import { ensureTabState } from './state'

const DEBUGGER_VERSION = '1.3'

export async function attachDebugger(tabId: number) {
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

  await sendCdp(tabId, 'Accessibility.enable')
}

export async function sendCdp(tabId: number, method: string, params?: Record<string, unknown>) {
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
