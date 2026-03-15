import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const TYPES_PATH = join(import.meta.dirname, '../src/browser-use/types.ts')
const OUTPUT_PATH = join(import.meta.dirname, '../../../skills/built-in/references/action-index.json')
const ACTION_PATTERN = /action:\s*'([A-Z_]+)'/g

const ACTION_TO_REFERENCE: Record<string, string> = {
  NAVIGATE: 'references/browser-orchestration.md',
  GET_URL: 'references/browser-orchestration.md',
  GET_TITLE: 'references/browser-orchestration.md',
  TAB_LIST: 'references/browser-orchestration.md',
  TAB_NEW: 'references/browser-orchestration.md',
  TAB_SWITCH: 'references/browser-orchestration.md',
  TAB_CLOSE: 'references/browser-orchestration.md',
  IS_CONNECTION_ALIVE: 'references/browser-orchestration.md',
  GET_COOKIES: 'references/cookie-management.md',
  SET_COOKIES: 'references/cookie-management.md',
  CLEAR_COOKIES: 'references/cookie-management.md',
  ATTACH_DEBUGGER: 'references/debugger-cdp.md',
  SEND_CDP: 'references/debugger-cdp.md',
  PARSE_REF: 'references/snapshot-refs.md',
  GET_SNAPSHOT: 'references/snapshot-refs.md',
  ENSURE_TAB_STATE: 'references/snapshot-refs.md',
  UPDATE_TAB_STATE: 'references/snapshot-refs.md',
  RESOLVE_ELEMENT_CENTER: 'references/element-queries.md',
  RESOLVE_ELEMENT_OBJECT_ID: 'references/element-queries.md',
  GET_ELEMENT_TEXT: 'references/element-queries.md',
  GET_ELEMENT_ATTRIBUTE: 'references/element-queries.md',
  IS_ELEMENT_VISIBLE: 'references/element-queries.md',
  IS_ELEMENT_ENABLED: 'references/element-queries.md',
  IS_ELEMENT_CHECKED: 'references/element-queries.md',
  GET_ELEMENT_INNER_TEXT: 'references/element-queries.md',
  GET_ELEMENT_INNER_HTML: 'references/element-queries.md',
  GET_ELEMENT_INPUT_VALUE: 'references/element-queries.md',
  SET_ELEMENT_VALUE: 'references/element-queries.md',
  GET_ELEMENT_BOUNDING_BOX: 'references/element-queries.md',
  GET_ELEMENT_COUNT: 'references/element-queries.md',
  GET_ELEMENT_STYLES: 'references/element-queries.md',
  CLICK: 'references/element-interactions.md',
  DBLCLICK: 'references/element-interactions.md',
  HOVER: 'references/element-interactions.md',
  FILL: 'references/element-interactions.md',
  TYPE_TEXT: 'references/element-interactions.md',
  PRESS_KEY: 'references/element-interactions.md',
  SCROLL: 'references/element-interactions.md',
  SELECT_OPTION: 'references/element-interactions.md',
  CHECK: 'references/element-interactions.md',
  UNCHECK: 'references/element-interactions.md',
  FOCUS: 'references/element-interactions.md',
  CLEAR: 'references/element-interactions.md',
  SELECT_ALL: 'references/element-interactions.md',
  SCROLL_INTO_VIEW: 'references/element-interactions.md',
  DISPATCH_EVENT: 'references/element-interactions.md',
  HIGHLIGHT: 'references/element-interactions.md',
  TAP_TOUCH: 'references/element-interactions.md',
  TAKE_SCREENSHOT: 'references/visual-operations.md',
  GET_STORAGE: 'references/storage-management.md',
  SET_STORAGE: 'references/storage-management.md',
  CLEAR_STORAGE: 'references/storage-management.md',
  RECORDING_START: 'references/recording.md',
  RECORDING_ADD_FRAME: 'references/recording.md',
  RECORDING_STOP: 'references/recording.md',
  RECORDING_RESTART: 'references/recording.md',
  GET_LAST_RECORDING_FRAMES: 'references/recording.md',
}

function getActionsFromTypes() {
  const content = readFileSync(TYPES_PATH, 'utf-8')
  const actions = new Set<string>()

  let match = ACTION_PATTERN.exec(content)
  while (match) {
    actions.add(match[1])
    match = ACTION_PATTERN.exec(content)
  }

  return [...actions].toSorted()
}

function main() {
  const actions = getActionsFromTypes()
  const undocumented = actions.filter(action => !ACTION_TO_REFERENCE[action])
  const extraMappings = Object.keys(ACTION_TO_REFERENCE).filter(action => !actions.includes(action))

  const payload = {
    source: 'packages/extension/src/browser-use/types.ts',
    totalActions: actions.length,
    undocumented,
    extraMappings,
    actions: actions.map(action => ({
      action,
      reference: ACTION_TO_REFERENCE[action] ?? null,
    })),
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8')
  console.log(`Generated action index: ${OUTPUT_PATH}`)
  console.log(`Total actions: ${actions.length}`)
  console.log(`Undocumented actions: ${undocumented.length}`)
}

main()
