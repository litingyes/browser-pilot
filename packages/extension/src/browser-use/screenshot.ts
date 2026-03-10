import { attachDebugger, sendCdp } from './debugger'
import { resolveElementObjectId } from './element'

type ScreenshotFormat = 'png' | 'jpeg'

export interface ScreenshotOptions {
  selector?: string
  path?: string
  fullPage?: boolean
  format?: ScreenshotFormat
  quality?: number
}

interface ViewportClip {
  x: number
  y: number
  width: number
  height: number
  scale: number
}

interface CaptureScreenshotParams {
  format: ScreenshotFormat
  quality?: number
  clip?: ViewportClip
  fromSurface: boolean
  captureBeyondViewport?: boolean
}

interface CaptureScreenshotResponse {
  data?: string
}

interface RuntimeEvaluateResponse {
  result?: {
    value?: unknown
  }
}

interface LayoutMetricsResponse {
  contentSize?: {
    width?: number
    height?: number
  }
  cssContentSize?: {
    width?: number
    height?: number
  }
}

interface ElementRect {
  x: number
  y: number
  width: number
  height: number
}

export interface ScreenshotResult {
  path: string
  data: string
  dataUrl: string
}

function isElementRect(value: unknown): value is ElementRect {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const rect = value as Record<string, unknown>
  return (
    typeof rect.x === 'number'
    && typeof rect.y === 'number'
    && typeof rect.width === 'number'
    && typeof rect.height === 'number'
  )
}

function normalizeFormat(format?: string): ScreenshotFormat {
  return format === 'jpeg' ? 'jpeg' : 'png'
}

function normalizeQuality(format: ScreenshotFormat, quality?: number) {
  if (format !== 'jpeg') {
    return undefined
  }

  const fallback = 80
  const value = typeof quality === 'number' ? quality : fallback
  const clamped = Math.min(100, Math.max(0, Math.round(value)))
  return clamped
}

function toFileExtension(format: ScreenshotFormat) {
  return format === 'jpeg' ? 'jpg' : 'png'
}

export async function takeScreenshot(
  tabId: number,
  options: ScreenshotOptions = {},
): Promise<ScreenshotResult> {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'Page.enable')
  await sendCdp(tabId, 'Runtime.enable')

  const format = normalizeFormat(options.format)
  const params: CaptureScreenshotParams = {
    captureBeyondViewport: options.fullPage ? true : undefined,
    format,
    fromSurface: true,
    quality: normalizeQuality(format, options.quality),
  }

  if (options.fullPage) {
    const metrics = await sendCdp(tabId, 'Page.getLayoutMetrics') as LayoutMetricsResponse
    const contentSize = metrics.contentSize ?? metrics.cssContentSize
    if (contentSize) {
      const width = Math.max(1, contentSize.width ?? 1280)
      const height = Math.max(1, contentSize.height ?? 720)
      params.clip = {
        height,
        scale: 1,
        width,
        x: 0,
        y: 0,
      }
    }
  }
  else if (options.selector) {
    const objectId = await resolveElementObjectId(tabId, options.selector)
    const rectResult = await sendCdp(tabId, 'Runtime.callFunctionOn', {
      awaitPromise: false,
      functionDeclaration: `function() {
        const rect = this.getBoundingClientRect();
        return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
      }`,
      objectId,
      returnByValue: true,
    }) as RuntimeEvaluateResponse

    if (isElementRect(rectResult.result?.value)) {
      const { x, y, width, height } = rectResult.result.value
      params.clip = {
        height: Math.max(1, height),
        scale: 1,
        width: Math.max(1, width),
        x,
        y,
      }
    }
    else {
      throw new Error(`Could not resolve element rect for: ${options.selector}`)
    }
  }

  const result = await sendCdp(
    tabId,
    'Page.captureScreenshot',
    params as unknown as Record<string, unknown>,
  ) as CaptureScreenshotResponse
  const data = result.data
  if (!data) {
    throw new Error('Page.captureScreenshot returned empty data')
  }

  const extension = toFileExtension(format)
  const path = options.path || `screenshot-${Date.now()}.${extension}`
  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'

  return {
    data,
    dataUrl: `data:${mimeType};base64,${data}`,
    path,
  }
}
