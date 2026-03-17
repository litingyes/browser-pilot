import { attachDebugger, sendCdp } from './debugger'
import { ensureTabState } from './state'

const REF_PATTERN = /^e\d+$/

interface RuntimeRemoteObject {
  value?: unknown
  objectId?: string
}

interface RuntimeEvaluateResponse {
  result?: RuntimeRemoteObject
}

interface DomResolveNodeResponse {
  object?: {
    objectId?: string
  }
}

interface DomGetBoxModelResponse {
  model?: {
    content?: number[]
  }
}

interface AXValue {
  value?: string | number | boolean
}

interface AXNode {
  ignored?: boolean
  role?: AXValue
  name?: AXValue
  backendDOMNodeId?: number
}

interface AXTreeResponse {
  nodes?: AXNode[]
}

interface ElementCenter {
  x: number
  y: number
}

interface ElementBoundingBox {
  x: number
  y: number
  width: number
  height: number
}

export function parseRef(input: string): string | null {
  const trimmed = input.trim()

  if (trimmed.startsWith('@')) {
    const ref = trimmed.slice(1)
    return REF_PATTERN.test(ref) ? ref : null
  }

  if (trimmed.startsWith('ref=')) {
    const ref = trimmed.slice('ref='.length)
    return REF_PATTERN.test(ref) ? ref : null
  }

  return REF_PATTERN.test(trimmed) ? trimmed : null
}

function isElementCenter(value: unknown): value is ElementCenter {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const maybe = value as Record<string, unknown>
  return typeof maybe.x === 'number' && typeof maybe.y === 'number'
}

function isElementBoundingBox(value: unknown): value is ElementBoundingBox {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const maybe = value as Record<string, unknown>
  return (
    typeof maybe.x === 'number'
    && typeof maybe.y === 'number'
    && typeof maybe.width === 'number'
    && typeof maybe.height === 'number'
  )
}

async function evaluateValue(tabId: number, expression: string) {
  const result = await sendCdp(tabId, 'Runtime.evaluate', {
    expression,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value
}

function axToString(value?: AXValue) {
  if (value?.value === undefined || value?.value === null) {
    return ''
  }
  return String(value.value)
}

async function findBackendNodeIdByRoleName(
  tabId: number,
  role: string,
  name: string,
  nth?: number,
) {
  const response = await sendCdp(tabId, 'Accessibility.getFullAXTree') as AXTreeResponse
  const nodes = response.nodes ?? []
  const nthIndex = nth ?? 0
  let matchCount = 0

  for (const node of nodes) {
    if (node.ignored) {
      continue
    }
    const nodeRole = axToString(node.role)
    const nodeName = axToString(node.name)
    if (nodeRole !== role || nodeName !== name) {
      continue
    }

    if (matchCount === nthIndex) {
      const backendNodeId = node.backendDOMNodeId
      if (!backendNodeId) {
        throw new Error(`AX node has no backendDOMNodeId for role=${role} name=${name}`)
      }
      return backendNodeId
    }

    matchCount += 1
  }

  throw new Error(`Could not locate element with role=${role} name=${name}`)
}

async function resolveBySelector(tabId: number, selector: string): Promise<ElementCenter> {
  const value = await evaluateValue(tabId, `(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  })()`)

  if (!isElementCenter(value)) {
    throw new Error(`Element not found: ${selector}`)
  }
  return value
}

export async function resolveElementCenter(tabId: number, selectorOrRef: string): Promise<ElementCenter> {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'DOM.enable')

  const refId = parseRef(selectorOrRef)
  if (!refId) {
    return resolveBySelector(tabId, selectorOrRef)
  }

  const state = ensureTabState(tabId)
  const ref = state.refs[refId]
  if (!ref) {
    throw new Error(`Unknown ref: ${refId}`)
  }

  if (ref.backendNodeId) {
    try {
      const boxModel = await sendCdp(tabId, 'DOM.getBoxModel', {
        backendNodeId: ref.backendNodeId,
      }) as DomGetBoxModelResponse

      const content = boxModel.model?.content ?? []
      if (content.length >= 8) {
        const x = (content[0] + content[2] + content[4] + content[6]) / 4
        const y = (content[1] + content[3] + content[5] + content[7]) / 4
        return { x, y }
      }
    }
    catch {
      // stale backendNodeId; fallback to AX role/name/nth resolution below
    }
  }

  const freshBackendNodeId = await findBackendNodeIdByRoleName(tabId, ref.role, ref.name, ref.nth)
  const boxModel = await sendCdp(tabId, 'DOM.getBoxModel', {
    backendNodeId: freshBackendNodeId,
  }) as DomGetBoxModelResponse
  const content = boxModel.model?.content ?? []
  if (content.length >= 8) {
    const x = (content[0] + content[2] + content[4] + content[6]) / 4
    const y = (content[1] + content[3] + content[5] + content[7]) / 4
    return { x, y }
  }

  throw new Error(`Could not resolve element center for ref: ${refId}`)
}

export async function resolveElementObjectId(tabId: number, selectorOrRef: string): Promise<string> {
  await attachDebugger(tabId)
  await sendCdp(tabId, 'DOM.enable')
  await sendCdp(tabId, 'Runtime.enable')
  await sendCdp(tabId, 'Accessibility.enable')

  const refId = parseRef(selectorOrRef)
  if (refId) {
    const state = ensureTabState(tabId)
    const ref = state.refs[refId]
    if (!ref) {
      throw new Error(`Unknown ref: ${refId}`)
    }

    if (ref.backendNodeId) {
      try {
        const resolveResult = await sendCdp(tabId, 'DOM.resolveNode', {
          backendNodeId: ref.backendNodeId,
          objectGroup: 'agent-browser',
        }) as DomResolveNodeResponse

        const objectId = resolveResult.object?.objectId
        if (objectId) {
          return objectId
        }
      }
      catch {
        // stale backendNodeId; fallback to AX role/name/nth resolution below
      }
    }

    const freshBackendNodeId = await findBackendNodeIdByRoleName(tabId, ref.role, ref.name, ref.nth)
    const resolveResult = await sendCdp(tabId, 'DOM.resolveNode', {
      backendNodeId: freshBackendNodeId,
      objectGroup: 'agent-browser',
    }) as DomResolveNodeResponse

    const objectId = resolveResult.object?.objectId
    if (objectId) {
      return objectId
    }

    throw new Error(`No objectId for ref ${refId}`)
  }

  const evaluateResult = await sendCdp(tabId, 'Runtime.evaluate', {
    expression: `document.querySelector(${JSON.stringify(selectorOrRef)})`,
    returnByValue: false,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  const objectId = evaluateResult.result?.objectId
  if (!objectId) {
    throw new Error(`Element not found: ${selectorOrRef}`)
  }

  return objectId
}

export async function getElementText(tabId: number, selectorOrRef: string): Promise<string> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return this.innerText || this.textContent || ""; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return typeof result.result?.value === 'string' ? result.result.value : ''
}

export async function getElementAttribute(
  tabId: number,
  selectorOrRef: string,
  attribute: string,
): Promise<unknown> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() { return this.getAttribute(${JSON.stringify(attribute)}); }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value
}

export async function isElementVisible(tabId: number, selectorOrRef: string): Promise<boolean> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      const rect = this.getBoundingClientRect();
      const style = window.getComputedStyle(this);
      return rect.width > 0 &&
             rect.height > 0 &&
             style.visibility !== 'hidden' &&
             style.display !== 'none' &&
             parseFloat(style.opacity) > 0;
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value === true
}

export async function isElementEnabled(tabId: number, selectorOrRef: string): Promise<boolean> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return !this.disabled; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value !== false
}

export async function isElementChecked(tabId: number, selectorOrRef: string): Promise<boolean> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return !!this.checked; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value === true
}

export async function getElementInnerText(tabId: number, selectorOrRef: string): Promise<string> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return this.innerText || ""; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return typeof result.result?.value === 'string' ? result.result.value : ''
}

export async function getElementInnerHtml(tabId: number, selectorOrRef: string): Promise<string> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return this.innerHTML || ""; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return typeof result.result?.value === 'string' ? result.result.value : ''
}

export async function getElementInputValue(tabId: number, selectorOrRef: string): Promise<string> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { return typeof this.value === "string" ? this.value : ""; }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return typeof result.result?.value === 'string' ? result.result.value : ''
}

export async function setElementValue(tabId: number, selectorOrRef: string, value: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      this.value = ${JSON.stringify(value)};
      this.dispatchEvent(new Event('input', { bubbles: true }));
      this.dispatchEvent(new Event('change', { bubbles: true }));
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function getElementBoundingBox(
  tabId: number,
  selectorOrRef: string,
): Promise<ElementBoundingBox> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      const r = this.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  if (!isElementBoundingBox(result.result?.value)) {
    throw new Error(`Could not get bounding box for: ${selectorOrRef}`)
  }
  return result.result.value
}

export async function getElementCount(tabId: number, selector: string): Promise<number> {
  await attachDebugger(tabId)
  const value = await evaluateValue(
    tabId,
    `document.querySelectorAll(${JSON.stringify(selector)}).length`,
  )

  return typeof value === 'number' ? value : 0
}

export async function getElementStyles(
  tabId: number,
  selectorOrRef: string,
  properties?: string[],
): Promise<unknown> {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  const functionDeclaration = Array.isArray(properties)
    ? `function() {
      const s = window.getComputedStyle(this);
      const props = ${JSON.stringify(properties)};
      const result = {};
      for (const p of props) result[p] = s.getPropertyValue(p);
      return result;
    }`
    : `function() {
      const s = window.getComputedStyle(this);
      const result = {};
      for (let i = 0; i < s.length; i++) {
        const p = s[i];
        result[p] = s.getPropertyValue(p);
      }
      return result;
    }`

  const result = await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  }) as RuntimeEvaluateResponse

  return result.result?.value ?? null
}
