import { attachDebugger, sendCdp } from './debugger'
import { isElementChecked, resolveElementCenter, resolveElementObjectId } from './element'

type MouseButton = 'left' | 'right' | 'middle'

const ALPHA_CHAR_PATTERN = /^[a-z]$/i
const DIGIT_CHAR_PATTERN = /^\d$/

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function buttonToButtonsValue(button: MouseButton) {
  switch (button) {
    case 'right':
      return 2
    case 'middle':
      return 4
    case 'left':
    default:
      return 1
  }
}

function charToKeyInfo(ch: string) {
  if (ch === '\n' || ch === '\r') {
    return { key: 'Enter', code: 'Enter', keyCode: 13 }
  }
  if (ch === '\t') {
    return { key: 'Tab', code: 'Tab', keyCode: 9 }
  }
  if (ch === ' ') {
    return { key: ' ', code: 'Space', keyCode: 32 }
  }

  const upper = ch.toUpperCase()
  const isAlpha = ALPHA_CHAR_PATTERN.test(ch)
  const isDigit = DIGIT_CHAR_PATTERN.test(ch)

  return {
    key: ch,
    code: isAlpha ? `Key${upper}` : (isDigit ? `Digit${ch}` : ''),
    keyCode: ch.charCodeAt(0),
  }
}

function namedKeyInfo(key: string) {
  const k = key.toLowerCase()

  switch (k) {
    case 'enter':
    case 'return':
      return { key: 'Enter', code: 'Enter', keyCode: 13 }
    case 'tab':
      return { key: 'Tab', code: 'Tab', keyCode: 9 }
    case 'escape':
    case 'esc':
      return { key: 'Escape', code: 'Escape', keyCode: 27 }
    case 'backspace':
      return { key: 'Backspace', code: 'Backspace', keyCode: 8 }
    case 'delete':
      return { key: 'Delete', code: 'Delete', keyCode: 46 }
    case 'arrowup':
    case 'up':
      return { key: 'ArrowUp', code: 'ArrowUp', keyCode: 38 }
    case 'arrowdown':
    case 'down':
      return { key: 'ArrowDown', code: 'ArrowDown', keyCode: 40 }
    case 'arrowleft':
    case 'left':
      return { key: 'ArrowLeft', code: 'ArrowLeft', keyCode: 37 }
    case 'arrowright':
    case 'right':
      return { key: 'ArrowRight', code: 'ArrowRight', keyCode: 39 }
    case 'home':
      return { key: 'Home', code: 'Home', keyCode: 36 }
    case 'end':
      return { key: 'End', code: 'End', keyCode: 35 }
    case 'pageup':
      return { key: 'PageUp', code: 'PageUp', keyCode: 33 }
    case 'pagedown':
      return { key: 'PageDown', code: 'PageDown', keyCode: 34 }
    case 'space':
    case ' ':
      return { key: ' ', code: 'Space', keyCode: 32 }
    default:
      if (key.length === 1) {
        return charToKeyInfo(key)
      }
      return { key, code: key, keyCode: 0 }
  }
}

async function dispatchClick(
  tabId: number,
  x: number,
  y: number,
  button: MouseButton,
  clickCount: number,
) {
  await sendCdp(tabId, 'Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x,
    y,
  })

  await sendCdp(tabId, 'Input.dispatchMouseEvent', {
    type: 'mousePressed',
    x,
    y,
    button,
    buttons: buttonToButtonsValue(button),
    clickCount,
  })

  await sendCdp(tabId, 'Input.dispatchMouseEvent', {
    type: 'mouseReleased',
    x,
    y,
    button,
    buttons: 0,
    clickCount,
  })
}

export async function click(
  tabId: number,
  selectorOrRef: string,
  button: MouseButton = 'left',
  clickCount = 1,
) {
  const { x, y } = await resolveElementCenter(tabId, selectorOrRef)
  await dispatchClick(tabId, x, y, button, clickCount)
}

export async function dblclick(tabId: number, selectorOrRef: string) {
  await click(tabId, selectorOrRef, 'left', 2)
}

export async function hover(tabId: number, selectorOrRef: string) {
  const { x, y } = await resolveElementCenter(tabId, selectorOrRef)
  await sendCdp(tabId, 'Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x,
    y,
  })
}

export async function fill(tabId: number, selectorOrRef: string, value: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)

  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { this.focus(); }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })

  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      if (typeof this.select === 'function') {
        this.select()
      }
      this.value = ''
      this.dispatchEvent(new Event('input', { bubbles: true }))
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })

  await sendCdp(tabId, 'Input.insertText', {
    text: value,
  })
}

export async function typeText(
  tabId: number,
  selectorOrRef: string,
  text: string,
  clear = false,
  delayMs = 0,
) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)

  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { this.focus(); }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })

  if (clear) {
    await sendCdp(tabId, 'Runtime.callFunctionOn', {
      functionDeclaration: `function() {
        if (typeof this.select === 'function') {
          this.select()
        }
        this.value = ''
        this.dispatchEvent(new Event('input', { bubbles: true }))
      }`,
      objectId,
      returnByValue: true,
      awaitPromise: false,
    })
  }

  for (const ch of text) {
    const { key, code, keyCode } = charToKeyInfo(ch)

    await sendCdp(tabId, 'Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      code,
      text: ch,
      unmodifiedText: ch,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    })

    await sendCdp(tabId, 'Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode: keyCode,
      nativeVirtualKeyCode: keyCode,
    })

    if (delayMs > 0) {
      await sleep(delayMs)
    }
  }
}

export async function pressKey(tabId: number, key: string) {
  await attachDebugger(tabId)
  const info = namedKeyInfo(key)

  await sendCdp(tabId, 'Input.dispatchKeyEvent', {
    type: 'keyDown',
    key: info.key,
    code: info.code,
    windowsVirtualKeyCode: info.keyCode,
    nativeVirtualKeyCode: info.keyCode,
  })

  await sendCdp(tabId, 'Input.dispatchKeyEvent', {
    type: 'keyUp',
    key: info.key,
    code: info.code,
    windowsVirtualKeyCode: info.keyCode,
    nativeVirtualKeyCode: info.keyCode,
  })
}

export async function scroll(
  tabId: number,
  options: {
    selectorOrRef?: string
    deltaX: number
    deltaY: number
  },
) {
  const { selectorOrRef, deltaX, deltaY } = options

  if (selectorOrRef) {
    const objectId = await resolveElementObjectId(tabId, selectorOrRef)
    await sendCdp(tabId, 'Runtime.callFunctionOn', {
      functionDeclaration: 'function(dx, dy) { this.scrollBy(dx, dy); }',
      objectId,
      arguments: [
        { value: deltaX },
        { value: deltaY },
      ],
      returnByValue: true,
      awaitPromise: false,
    })
    return
  }

  await sendCdp(tabId, 'Runtime.evaluate', {
    expression: `window.scrollBy(${deltaX}, ${deltaY})`,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function selectOption(tabId: number, selectorOrRef: string, values: string[]) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function(vals) {
      const options = Array.from(this.options || [])
      for (const opt of options) {
        const text = (opt.textContent || '').trim()
        opt.selected = vals.includes(opt.value) || vals.includes(text)
      }
      this.dispatchEvent(new Event('change', { bubbles: true }))
    }`,
    objectId,
    arguments: [{ value: values }],
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function check(tabId: number, selectorOrRef: string) {
  const checked = await isElementChecked(tabId, selectorOrRef)
  if (!checked) {
    await click(tabId, selectorOrRef)
  }
}

export async function uncheck(tabId: number, selectorOrRef: string) {
  const checked = await isElementChecked(tabId, selectorOrRef)
  if (checked) {
    await click(tabId, selectorOrRef)
  }
}

export async function focus(tabId: number, selectorOrRef: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: 'function() { this.focus(); }',
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function clear(tabId: number, selectorOrRef: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      this.focus()
      this.value = ''
      this.dispatchEvent(new Event('input', { bubbles: true }))
      this.dispatchEvent(new Event('change', { bubbles: true }))
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function selectAll(tabId: number, selectorOrRef: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      this.focus()
      if (typeof this.select === 'function') {
        this.select()
      } else {
        const range = document.createRange()
        range.selectNodeContents(this)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
      }
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function scrollIntoView(tabId: number, selectorOrRef: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      this.scrollIntoView({ block: 'center', inline: 'center' })
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function dispatchEvent(
  tabId: number,
  selectorOrRef: string,
  eventType: string,
  eventInit?: Record<string, unknown>,
) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function(type, init) {
      this.dispatchEvent(new Event(type, init || { bubbles: true }))
    }`,
    objectId,
    arguments: [
      { value: eventType },
      { value: eventInit ?? { bubbles: true } },
    ],
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function highlight(tabId: number, selectorOrRef: string) {
  const objectId = await resolveElementObjectId(tabId, selectorOrRef)
  await sendCdp(tabId, 'Runtime.callFunctionOn', {
    functionDeclaration: `function() {
      const previousOutline = this.style.outline
      const previousOffset = this.style.outlineOffset
      this.style.outline = '2px solid red'
      this.style.outlineOffset = '2px'
      const el = this
      setTimeout(() => {
        el.style.outline = previousOutline
        el.style.outlineOffset = previousOffset
      }, 3000)
    }`,
    objectId,
    returnByValue: true,
    awaitPromise: false,
  })
}

export async function tapTouch(tabId: number, selectorOrRef: string) {
  const { x, y } = await resolveElementCenter(tabId, selectorOrRef)

  await sendCdp(tabId, 'Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ x, y }],
  })

  await sendCdp(tabId, 'Input.dispatchTouchEvent', {
    type: 'touchEnd',
    touchPoints: [],
  })
}
