import { attachDebugger, sendCdp } from './debugger'
import { ensureTabState } from './state'

const DEFAULT_TIMEOUT_MS = 25_000
const NETWORK_IDLE_QUIET_MS = 500
const NETWORK_IDLE_EVENT_GAP_MS = 600

export type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle'

interface CdpEventSource {
  tabId?: number
}

interface CdpEventParams {
  requestId?: string
}

interface BrowserTabLike {
  id?: number
  index?: number
  title?: string
  url?: string
  active?: boolean
  windowId?: number
}

interface NavigateResult {
  errorText?: string
}

interface RuntimeEvaluateResponse {
  result?: {
    value?: unknown
  }
}

interface BrowserTabView {
  id: number
  title: string
  url: string
  active: boolean
}

function asMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function normalizeTabs(tabs: BrowserTabLike[]) {
  return tabs
    .filter(tab => Number.isInteger(tab.id))
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
}

async function getWindowTabsFor(tabId: number) {
  const sourceTab = await browser.tabs.get(tabId) as BrowserTabLike
  if (sourceTab.windowId === undefined) {
    throw new Error(`Cannot resolve window for tab: ${tabId}`)
  }

  const tabs = await browser.tabs.query({ windowId: sourceTab.windowId }) as BrowserTabLike[]
  return normalizeTabs(tabs)
}

function waitForEvent(tabId: number, eventName: string, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout>

    const onEvent = (source: CdpEventSource, method: string) => {
      if (source.tabId !== tabId) {
        return
      }
      if (method !== eventName) {
        return
      }

      clearTimeout(timer)
      browser.debugger.onEvent.removeListener(onEvent)
      resolve()
    }

    timer = setTimeout(() => {
      browser.debugger.onEvent.removeListener(onEvent)
      reject(new Error(`Timeout waiting for ${eventName}`))
    }, timeoutMs)

    browser.debugger.onEvent.addListener(onEvent)
  })
}

function waitForNetworkIdle(tabId: number, timeoutMs: number) {
  return new Promise<void>((resolve, reject) => {
    const pending = new Set<string>()
    let idleStart: number | null = null
    let lastActivityAt = Date.now()

    const timer = setTimeout(() => {
      cleanup()
      reject(new Error('Timeout waiting for networkidle'))
    }, timeoutMs)

    const interval = setInterval(() => {
      if (
        pending.size === 0
        && idleStart !== null
        && Date.now() - idleStart >= NETWORK_IDLE_QUIET_MS
      ) {
        cleanup()
        resolve()
      }
    }, 100)

    const onEvent = (
      source: CdpEventSource,
      method: string,
      params?: object,
    ) => {
      if (source.tabId !== tabId) {
        return
      }

      lastActivityAt = Date.now()

      const cdpParams = (params ?? {}) as CdpEventParams

      if (method === 'Network.requestWillBeSent' && cdpParams.requestId) {
        pending.add(cdpParams.requestId)
        idleStart = null
        return
      }

      if (
        (method === 'Network.loadingFinished' || method === 'Network.loadingFailed')
        && cdpParams.requestId
      ) {
        pending.delete(cdpParams.requestId)
        if (pending.size === 0) {
          idleStart = Date.now()
        }
        return
      }

      if (method === 'Page.loadEventFired') {
        if (pending.size === 0) {
          idleStart = Date.now()
        }
        return
      }

      if (pending.size === 0 && Date.now() - lastActivityAt >= NETWORK_IDLE_EVENT_GAP_MS) {
        idleStart ??= Date.now()
      }
    }

    function cleanup() {
      clearTimeout(timer)
      clearInterval(interval)
      browser.debugger.onEvent.removeListener(onEvent)
    }

    browser.debugger.onEvent.addListener(onEvent)
  })
}

async function waitForLifecycle(tabId: number, waitUntil: WaitUntil, timeoutMs: number) {
  if (waitUntil === 'networkidle') {
    await waitForNetworkIdle(tabId, timeoutMs)
    return
  }

  const eventName = waitUntil === 'domcontentloaded'
    ? 'Page.domContentEventFired'
    : 'Page.loadEventFired'
  await waitForEvent(tabId, eventName, timeoutMs)
}

async function evaluateString(tabId: number, expression: string) {
  const result = await sendCdp(tabId, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return typeof result.result?.value === 'string' ? result.result.value : ''
}

export function toAiFriendlyError(error: string) {
  const lower = error.toLowerCase()

  if (lower.includes('strict mode violation')) {
    return 'Element matched multiple results. Use a more specific selector.'
  }
  if (lower.includes('element is not visible')) {
    return 'Element exists but is not visible. Wait for it to become visible or scroll it into view.'
  }
  if (lower.includes('intercept')) {
    return 'Another element is covering the target element. Try scrolling or closing overlays.'
  }
  if (lower.includes('timeout')) {
    return 'Operation timed out. The page may still be loading or the element may not exist.'
  }
  if (lower.includes('element not found') || lower.includes('no element')) {
    return 'Element not found. Verify the selector is correct and the element exists in the DOM.'
  }

  return error
}

export async function navigate(
  tabId: number,
  url: string,
  waitUntil: WaitUntil = 'load',
) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Page.enable')
  await sendCdp(tabId, 'Network.enable')
  await sendCdp(tabId, 'Runtime.enable')

  const navResult = await sendCdp(tabId, 'Page.navigate', { url }) as NavigateResult
  if (typeof navResult.errorText === 'string' && navResult.errorText.length > 0) {
    throw new Error(`Navigation failed: ${navResult.errorText}`)
  }

  await waitForLifecycle(tabId, waitUntil, DEFAULT_TIMEOUT_MS)

  const [resolvedUrl, title] = await Promise.all([
    getUrl(tabId),
    getTitle(tabId),
  ])

  return {
    title,
    url: resolvedUrl || url,
  }
}

export async function getUrl(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Runtime.enable')
  return evaluateString(tabId, 'location.href')
}

export async function getTitle(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Runtime.enable')
  return evaluateString(tabId, 'document.title')
}

export async function getContent(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Runtime.enable')
  return evaluateString(tabId, 'document.documentElement.outerHTML')
}

export async function tabList(tabId: number) {
  const tabs = await getWindowTabsFor(tabId)
  const mapped = tabs.map((tab): BrowserTabView => ({
    active: Boolean(tab.active),
    id: tab.id!,
    title: tab.title ?? '',
    url: tab.url ?? '',
  }))

  return mapped.map((tab, index) => ({
    ...tab,
    index,
    type: 'page',
  }))
}

export async function tabNew(tabId: number, url?: string) {
  const sourceTab = await browser.tabs.get(tabId) as BrowserTabLike
  const created = await browser.tabs.create({
    active: true,
    url: url ?? 'about:blank',
    windowId: sourceTab.windowId,
  })

  if (!created.id) {
    throw new Error('Created tab has no id')
  }

  ensureTabState(created.id)
  const tabs = await getWindowTabsFor(created.id)
  const index = tabs.findIndex(tab => tab.id === created.id)

  return {
    index,
    tabId: created.id,
    url: created.url ?? (url ?? 'about:blank'),
  }
}

export async function tabSwitch(tabId: number, index: number) {
  const tabs = await getWindowTabsFor(tabId)
  if (index < 0 || index >= tabs.length) {
    throw new Error(`Tab index ${index} out of range (0-${tabs.length - 1})`)
  }

  const target = tabs[index]
  await browser.tabs.update(target.id!, { active: true })

  return {
    index,
    tabId: target.id!,
    title: target.title ?? '',
    url: target.url ?? '',
  }
}

export async function tabClose(tabId: number, index?: number) {
  const tabs = await getWindowTabsFor(tabId)
  if (tabs.length <= 1) {
    throw new Error('Cannot close the last tab')
  }

  const activeIndex = tabs.findIndex(tab => tab.active)
  const targetIndex = index ?? (activeIndex >= 0 ? activeIndex : 0)
  if (targetIndex < 0 || targetIndex >= tabs.length) {
    throw new Error(`Tab index ${targetIndex} out of range (0-${tabs.length - 1})`)
  }

  const target = tabs[targetIndex]
  await browser.tabs.remove(target.id!)

  const restTabs = await getWindowTabsFor(tabId)
  const nextActive = restTabs.findIndex(tab => tab.active)

  return {
    activeIndex: nextActive,
    closed: targetIndex,
  }
}

export async function isConnectionAlive(tabId: number) {
  await attachDebugger(tabId)

  try {
    await Promise.race([
      sendCdp(tabId, 'Browser.getVersion'),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), 3000)
      }),
    ])
    return true
  }
  catch {
    return false
  }
}

export function toFriendlyErrorMessage(error: unknown) {
  return toAiFriendlyError(asMessage(error))
}
