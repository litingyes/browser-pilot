import type { ScreenshotOptions } from './screenshot'
import type { StorageType } from './storage'

export interface BaseCommand {
  id: string
  typeId: number
  action: string
}

export type GetCookiesCommand = BaseCommand & {
  action: 'GET_COOKIES'
  urls?: string[]
}

export type SetCookiesCommand = BaseCommand & {
  action: 'SET_COOKIES'
  cookies: Record<string, unknown>[]
  currentUrl?: string
}

export type ClearCookiesCommand = BaseCommand & {
  action: 'CLEAR_COOKIES'
}

export type AttachDebuggerCommand = BaseCommand & {
  action: 'ATTACH_DEBUGGER'
}

export type SendCdpCommand = BaseCommand & {
  action: 'SEND_CDP'
  method: string
  params?: Record<string, unknown>
}

export type NavigateCommand = BaseCommand & {
  action: 'NAVIGATE'
  url: string
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle'
}

export type GetUrlCommand = BaseCommand & {
  action: 'GET_URL'
}

export type GetTitleCommand = BaseCommand & {
  action: 'GET_TITLE'
}

export type GetContentCommand = BaseCommand & {
  action: 'GET_CONTENT'
}

export type TabListCommand = BaseCommand & {
  action: 'TAB_LIST'
}

export type TabNewCommand = BaseCommand & {
  action: 'TAB_NEW'
  url?: string
}

export type TabSwitchCommand = BaseCommand & {
  action: 'TAB_SWITCH'
  index: number
}

export type TabCloseCommand = BaseCommand & {
  action: 'TAB_CLOSE'
  index?: number
}

export type IsConnectionAliveCommand = BaseCommand & {
  action: 'IS_CONNECTION_ALIVE'
}

export type ParseRefCommand = BaseCommand & {
  action: 'PARSE_REF'
  input: string
}

export type ResolveElementCenterCommand = BaseCommand & {
  action: 'RESOLVE_ELEMENT_CENTER'
  selectorOrRef: string
}

export type ResolveElementObjectIdCommand = BaseCommand & {
  action: 'RESOLVE_ELEMENT_OBJECT_ID'
  selectorOrRef: string
}

export type GetElementTextCommand = BaseCommand & {
  action: 'GET_ELEMENT_TEXT'
  selectorOrRef: string
}

export type GetElementAttributeCommand = BaseCommand & {
  action: 'GET_ELEMENT_ATTRIBUTE'
  selectorOrRef: string
  attribute: string
}

export type IsElementVisibleCommand = BaseCommand & {
  action: 'IS_ELEMENT_VISIBLE'
  selectorOrRef: string
}

export type IsElementEnabledCommand = BaseCommand & {
  action: 'IS_ELEMENT_ENABLED'
  selectorOrRef: string
}

export type IsElementCheckedCommand = BaseCommand & {
  action: 'IS_ELEMENT_CHECKED'
  selectorOrRef: string
}

export type GetElementInnerTextCommand = BaseCommand & {
  action: 'GET_ELEMENT_INNER_TEXT'
  selectorOrRef: string
}

export type GetElementInnerHtmlCommand = BaseCommand & {
  action: 'GET_ELEMENT_INNER_HTML'
  selectorOrRef: string
}

export type GetElementInputValueCommand = BaseCommand & {
  action: 'GET_ELEMENT_INPUT_VALUE'
  selectorOrRef: string
}

export type SetElementValueCommand = BaseCommand & {
  action: 'SET_ELEMENT_VALUE'
  selectorOrRef: string
  value: string
}

export type GetElementBoundingBoxCommand = BaseCommand & {
  action: 'GET_ELEMENT_BOUNDING_BOX'
  selectorOrRef: string
}

export type GetElementCountCommand = BaseCommand & {
  action: 'GET_ELEMENT_COUNT'
  selector: string
}

export type GetElementStylesCommand = BaseCommand & {
  action: 'GET_ELEMENT_STYLES'
  selectorOrRef: string
  properties?: string[]
}

export type ClickCommand = BaseCommand & {
  action: 'CLICK'
  selectorOrRef: string
  button?: 'left' | 'right' | 'middle'
  clickCount?: number
}

export type DblclickCommand = BaseCommand & {
  action: 'DBLCLICK'
  selectorOrRef: string
}

export type HoverCommand = BaseCommand & {
  action: 'HOVER'
  selectorOrRef: string
}

export type FillCommand = BaseCommand & {
  action: 'FILL'
  selectorOrRef: string
  value: string
}

export type TypeTextCommand = BaseCommand & {
  action: 'TYPE_TEXT'
  selectorOrRef: string
  text: string
  clear?: boolean
  delayMs?: number
}

export type PressKeyCommand = BaseCommand & {
  action: 'PRESS_KEY'
  key: string
}

export type ScrollCommand = BaseCommand & {
  action: 'SCROLL'
  options: {
    selectorOrRef?: string
    deltaX: number
    deltaY: number
  }
}

export type SelectOptionCommand = BaseCommand & {
  action: 'SELECT_OPTION'
  selectorOrRef: string
  values: string[]
}

export type CheckCommand = BaseCommand & {
  action: 'CHECK'
  selectorOrRef: string
}

export type UncheckCommand = BaseCommand & {
  action: 'UNCHECK'
  selectorOrRef: string
}

export type FocusCommand = BaseCommand & {
  action: 'FOCUS'
  selectorOrRef: string
}

export type ClearCommand = BaseCommand & {
  action: 'CLEAR'
  selectorOrRef: string
}

export type SelectAllCommand = BaseCommand & {
  action: 'SELECT_ALL'
  selectorOrRef: string
}

export type ScrollIntoViewCommand = BaseCommand & {
  action: 'SCROLL_INTO_VIEW'
  selectorOrRef: string
}

export type DispatchEventCommand = BaseCommand & {
  action: 'DISPATCH_EVENT'
  selectorOrRef: string
  eventType: string
  eventInit?: Record<string, unknown>
}

export type HighlightCommand = BaseCommand & {
  action: 'HIGHLIGHT'
  selectorOrRef: string
}

export type TapTouchCommand = BaseCommand & {
  action: 'TAP_TOUCH'
  selectorOrRef: string
}

export type RecordingStartCommand = BaseCommand & {
  action: 'RECORDING_START'
  path: string
}

export type RecordingAddFrameCommand = BaseCommand & {
  action: 'RECORDING_ADD_FRAME'
  frameData: string | Uint8Array | ArrayBuffer
}

export type RecordingStopCommand = BaseCommand & {
  action: 'RECORDING_STOP'
}

export type RecordingRestartCommand = BaseCommand & {
  action: 'RECORDING_RESTART'
  path: string
}

export type GetLastRecordingFramesCommand = BaseCommand & {
  action: 'GET_LAST_RECORDING_FRAMES'
}

export type TakeScreenshotCommand = BaseCommand & {
  action: 'TAKE_SCREENSHOT'
  options?: ScreenshotOptions
}

export type GetSnapshotCommand = BaseCommand & {
  action: 'GET_SNAPSHOT'
}

export type EnsureTabStateCommand = BaseCommand & {
  action: 'ENSURE_TAB_STATE'
}

export type UpdateTabStateCommand = BaseCommand & {
  action: 'UPDATE_TAB_STATE'
  state: Record<string, unknown>
}

export type GetStorageCommand = BaseCommand & {
  action: 'GET_STORAGE'
  storageType?: StorageType
  key?: string
}

export type SetStorageCommand = BaseCommand & {
  action: 'SET_STORAGE'
  key: string
  value: string
  storageType?: StorageType
}

export type ClearStorageCommand = BaseCommand & {
  action: 'CLEAR_STORAGE'
  storageType?: StorageType
}

export type Command = GetCookiesCommand | SetCookiesCommand | ClearCookiesCommand | AttachDebuggerCommand | SendCdpCommand | NavigateCommand | GetUrlCommand | GetTitleCommand | GetContentCommand | TabListCommand | TabNewCommand | TabSwitchCommand | TabCloseCommand | IsConnectionAliveCommand | ParseRefCommand | ResolveElementCenterCommand | ResolveElementObjectIdCommand | GetElementTextCommand | GetElementAttributeCommand | IsElementVisibleCommand | IsElementEnabledCommand | IsElementCheckedCommand | GetElementInnerTextCommand | GetElementInnerHtmlCommand | GetElementInputValueCommand | SetElementValueCommand | GetElementBoundingBoxCommand | GetElementCountCommand | GetElementStylesCommand | ClickCommand | DblclickCommand | HoverCommand | FillCommand | TypeTextCommand | PressKeyCommand | ScrollCommand | SelectOptionCommand | CheckCommand | UncheckCommand | FocusCommand | ClearCommand | SelectAllCommand | ScrollIntoViewCommand | DispatchEventCommand | HighlightCommand | TapTouchCommand | RecordingStartCommand | RecordingAddFrameCommand | RecordingStopCommand | RecordingRestartCommand | GetLastRecordingFramesCommand | TakeScreenshotCommand | GetSnapshotCommand | EnsureTabStateCommand | UpdateTabStateCommand | GetStorageCommand | SetStorageCommand | ClearStorageCommand
