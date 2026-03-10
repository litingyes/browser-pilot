import type { Command } from './types'
import { clearCookies, getCookies, setCookies } from './cookie'
import { attachDebugger, sendCdp } from './debugger'
import {
  getElementAttribute,
  getElementBoundingBox,
  getElementCount,
  getElementInnerHtml,
  getElementInnerText,
  getElementInputValue,
  getElementStyles,
  getElementText,
  isElementChecked,
  isElementEnabled,
  isElementVisible,
  parseRef,
  resolveElementCenter,
  resolveElementObjectId,
  setElementValue,
} from './element'
import {
  check,
  clear,
  click,
  dblclick,
  dispatchEvent,
  fill,
  focus,
  highlight,
  hover,
  pressKey,
  scroll,
  scrollIntoView,
  selectAll,
  selectOption,
  tapTouch,
  typeText,
  uncheck,
} from './interaction'
import {
  getLastRecordingFrames,
  recordingAddFrame,
  recordingRestart,
  recordingStart,
  recordingStop,
} from './recording'
import { takeScreenshot } from './screenshot'
import { getSnapshot } from './snapshot'
import { ensureTabState, updateTabState } from './state'
import { clearStorage, getStorage, setStorage } from './storage'

function getRecordingState(tabId: number) {
  const tabState = ensureTabState(tabId)

  return tabState.recordingState
}

export async function dispatchAction(command: Command) {
  switch (command.action) {
    case 'GET_COOKIES':
      return getCookies(command.typeId, command.urls)
    case 'SET_COOKIES':
      return setCookies(command.typeId, command.cookies, command.currentUrl)
    case 'CLEAR_COOKIES':
      return clearCookies(command.typeId)
    case 'ATTACH_DEBUGGER':
      return attachDebugger(command.typeId)
    case 'SEND_CDP':
      return sendCdp(command.typeId, command.method, command.params)
    case 'PARSE_REF':
      return parseRef(command.input)
    case 'RESOLVE_ELEMENT_CENTER':
      return resolveElementCenter(command.typeId, command.selectorOrRef)
    case 'RESOLVE_ELEMENT_OBJECT_ID':
      return resolveElementObjectId(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_TEXT':
      return getElementText(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_ATTRIBUTE':
      return getElementAttribute(command.typeId, command.selectorOrRef, command.attribute)
    case 'IS_ELEMENT_VISIBLE':
      return isElementVisible(command.typeId, command.selectorOrRef)
    case 'IS_ELEMENT_ENABLED':
      return isElementEnabled(command.typeId, command.selectorOrRef)
    case 'IS_ELEMENT_CHECKED':
      return isElementChecked(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_INNER_TEXT':
      return getElementInnerText(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_INNER_HTML':
      return getElementInnerHtml(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_INPUT_VALUE':
      return getElementInputValue(command.typeId, command.selectorOrRef)
    case 'SET_ELEMENT_VALUE':
      return setElementValue(command.typeId, command.selectorOrRef, command.value)
    case 'GET_ELEMENT_BOUNDING_BOX':
      return getElementBoundingBox(command.typeId, command.selectorOrRef)
    case 'GET_ELEMENT_COUNT':
      return getElementCount(command.typeId, command.selector)
    case 'GET_ELEMENT_STYLES':
      return getElementStyles(command.typeId, command.selectorOrRef, command.properties)
    case 'CLICK':
      return click(command.typeId, command.selectorOrRef, command.button, command.clickCount)
    case 'DBLCLICK':
      return dblclick(command.typeId, command.selectorOrRef)
    case 'HOVER':
      return hover(command.typeId, command.selectorOrRef)
    case 'FILL':
      return fill(command.typeId, command.selectorOrRef, command.value)
    case 'TYPE_TEXT':
      return typeText(command.typeId, command.selectorOrRef, command.text, command.clear, command.delayMs)
    case 'PRESS_KEY':
      return pressKey(command.typeId, command.key)
    case 'SCROLL':
      return scroll(command.typeId, command.options)
    case 'SELECT_OPTION':
      return selectOption(command.typeId, command.selectorOrRef, command.values)
    case 'CHECK':
      return check(command.typeId, command.selectorOrRef)
    case 'UNCHECK':
      return uncheck(command.typeId, command.selectorOrRef)
    case 'FOCUS':
      return focus(command.typeId, command.selectorOrRef)
    case 'CLEAR':
      return clear(command.typeId, command.selectorOrRef)
    case 'SELECT_ALL':
      return selectAll(command.typeId, command.selectorOrRef)
    case 'SCROLL_INTO_VIEW':
      return scrollIntoView(command.typeId, command.selectorOrRef)
    case 'DISPATCH_EVENT':
      return dispatchEvent(command.typeId, command.selectorOrRef, command.eventType, command.eventInit)
    case 'HIGHLIGHT':
      return highlight(command.typeId, command.selectorOrRef)
    case 'TAP_TOUCH':
      return tapTouch(command.typeId, command.selectorOrRef)
    case 'RECORDING_START':
      return recordingStart(getRecordingState(command.typeId), command.path)
    case 'RECORDING_ADD_FRAME':
      recordingAddFrame(getRecordingState(command.typeId), command.frameData)
      return { ok: true }
    case 'RECORDING_STOP':
      return recordingStop(getRecordingState(command.typeId))
    case 'RECORDING_RESTART':
      return recordingRestart(getRecordingState(command.typeId), command.path)
    case 'GET_LAST_RECORDING_FRAMES':
      return getLastRecordingFrames(getRecordingState(command.typeId))
    case 'TAKE_SCREENSHOT':
      return takeScreenshot(command.typeId, command.options)
    case 'GET_SNAPSHOT':
      return getSnapshot(command.typeId)
    case 'ENSURE_TAB_STATE':
      return ensureTabState(command.typeId)
    case 'UPDATE_TAB_STATE':
      return updateTabState(command.typeId, command.state as Parameters<typeof updateTabState>[1])
    case 'GET_STORAGE':
      return getStorage(command.typeId, command.storageType, command.key)
    case 'SET_STORAGE':
      return setStorage(command.typeId, command.key, command.value, command.storageType)
    case 'CLEAR_STORAGE':
      return clearStorage(command.typeId, command.storageType)
    default:
      return { success: false, error: 'Action not implemented' }
  }
}
