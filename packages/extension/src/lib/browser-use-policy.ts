import { db } from '@/lib/indexeddb'

const BROWSER_USE_POLICY_KEY = 'browser-use-policy'

export interface BrowserUsePolicy {
  blockMethodPrefixes: string[]
  blockMethods: string[]
  blockTabUrlPrefixes: string[]
  allowedNavigateProtocols: string[]
  requireConfirmationForSendCdp: boolean
  allowAgentTabIdOverride: boolean
}

export const DEFAULT_BROWSER_USE_POLICY: BrowserUsePolicy = {
  blockMethodPrefixes: ['Browser.', 'Target.', 'Debugger.', 'Security.'],
  blockMethods: [
    'Runtime.evaluate',
    'Runtime.callFunctionOn',
    'Page.addScriptToEvaluateOnNewDocument',
    'Page.createIsolatedWorld',
  ],
  blockTabUrlPrefixes: ['chrome://', 'edge://', 'about:', 'devtools://', 'moz-extension://'],
  allowedNavigateProtocols: ['http:', 'https:'],
  requireConfirmationForSendCdp: true,
  allowAgentTabIdOverride: true,
}

function normalizeList(input: unknown, fallback: string[]) {
  if (!Array.isArray(input)) {
    return [...fallback]
  }

  const normalized = [...new Set(input
    .map(item => String(item).trim())
    .filter(Boolean))]

  return normalized.length ? normalized : [...fallback]
}

function normalizeBoolean(input: unknown, fallback: boolean) {
  return typeof input === 'boolean' ? input : fallback
}

function normalizePolicy(input: Partial<BrowserUsePolicy> | null | undefined): BrowserUsePolicy {
  return {
    blockMethodPrefixes: normalizeList(input?.blockMethodPrefixes, DEFAULT_BROWSER_USE_POLICY.blockMethodPrefixes),
    blockMethods: normalizeList(input?.blockMethods, DEFAULT_BROWSER_USE_POLICY.blockMethods),
    blockTabUrlPrefixes: normalizeList(input?.blockTabUrlPrefixes, DEFAULT_BROWSER_USE_POLICY.blockTabUrlPrefixes),
    allowedNavigateProtocols: normalizeList(input?.allowedNavigateProtocols, DEFAULT_BROWSER_USE_POLICY.allowedNavigateProtocols),
    requireConfirmationForSendCdp: normalizeBoolean(input?.requireConfirmationForSendCdp, DEFAULT_BROWSER_USE_POLICY.requireConfirmationForSendCdp),
    allowAgentTabIdOverride: normalizeBoolean(input?.allowAgentTabIdOverride, DEFAULT_BROWSER_USE_POLICY.allowAgentTabIdOverride),
  }
}

export async function getBrowserUsePolicy(): Promise<BrowserUsePolicy> {
  const record = await db.settings.get(BROWSER_USE_POLICY_KEY)
  if (!record || typeof record.value !== 'object' || record.value === null) {
    return { ...DEFAULT_BROWSER_USE_POLICY }
  }

  return normalizePolicy(record.value as Partial<BrowserUsePolicy>)
}

export async function saveBrowserUsePolicy(partialPolicy: Partial<BrowserUsePolicy>) {
  const current = await getBrowserUsePolicy()
  const next = normalizePolicy({ ...current, ...partialPolicy })

  await db.settings.put({
    key: BROWSER_USE_POLICY_KEY,
    value: next,
    updatedAt: Date.now(),
  })

  return next
}

export async function initBrowserUsePolicy() {
  const existing = await db.settings.get(BROWSER_USE_POLICY_KEY)
  if (existing) {
    return
  }

  await db.settings.add({
    key: BROWSER_USE_POLICY_KEY,
    value: DEFAULT_BROWSER_USE_POLICY,
    updatedAt: Date.now(),
  })
}
