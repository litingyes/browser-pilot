import { attachDebugger, sendCdp } from './debugger'

export interface Cookie {
  name: string
  value: string
  domain: string
  path: string
  expires?: number
  size?: number
  httpOnly?: boolean
  secure?: boolean
  session?: boolean
  sameSite?: string
}

interface GetCookiesResponse {
  cookies?: Cookie[]
}

type CookieInput = Record<string, unknown>

interface SetCookiesResponse {
  success?: boolean
}

async function prepareNetwork(tabId: number) {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Network.enable')
}

export async function getCookies(tabId: number, urls?: string[]) {
  await prepareNetwork(tabId)

  const params = urls && urls.length > 0 ? { urls } : {}
  const result = await sendCdp(tabId, 'Network.getCookies', params) as GetCookiesResponse
  return result.cookies ?? []
}

export async function setCookies(
  tabId: number,
  cookies: CookieInput[],
  currentUrl?: string,
) {
  await prepareNetwork(tabId)

  const normalizedCookies = cookies.map((cookie) => {
    const hasUrl = typeof cookie.url === 'string' && cookie.url.length > 0
    const hasDomain = typeof cookie.domain === 'string' && cookie.domain.length > 0

    if (!hasUrl && !hasDomain && currentUrl) {
      return {
        ...cookie,
        url: currentUrl,
      }
    }

    return cookie
  })

  await sendCdp(tabId, 'Network.setCookies', {
    cookies: normalizedCookies,
  }) as SetCookiesResponse
}

export async function clearCookies(tabId: number) {
  await prepareNetwork(tabId)
  await sendCdp(tabId, 'Network.clearBrowserCookies')
}
