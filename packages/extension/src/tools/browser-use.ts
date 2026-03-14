import type { Command } from '@/browser-use/types'
import type { AgentContext } from '@/types'
import { tool } from 'ai'
import { z } from 'zod'
import { dispatchAction } from '@/browser-use'

const MAX_OUTPUT_STRING_LENGTH = 8192

function truncateLargeStrings(value: unknown): unknown {
  if (typeof value === 'string') {
    if (value.length <= MAX_OUTPUT_STRING_LENGTH) {
      return value
    }
    const hiddenLength = value.length - MAX_OUTPUT_STRING_LENGTH
    return `${value.slice(0, MAX_OUTPUT_STRING_LENGTH)}...[truncated ${hiddenLength} chars; fetch via screenshotId or a follow-up action]`
  }

  if (Array.isArray(value)) {
    return value.map(item => truncateLargeStrings(item))
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, truncateLargeStrings(nestedValue)]),
    )
  }

  return value
}

const browserUseActionSchema = z.enum([
  'NAVIGATE',
  'GET_URL',
  'GET_TITLE',
  'TAB_LIST',
  'TAB_NEW',
  'TAB_SWITCH',
  'TAB_CLOSE',
  'IS_CONNECTION_ALIVE',
  'GET_COOKIES',
  'SET_COOKIES',
  'CLEAR_COOKIES',
  'ATTACH_DEBUGGER',
  'SEND_CDP',
  'PARSE_REF',
  'RESOLVE_ELEMENT_CENTER',
  'RESOLVE_ELEMENT_OBJECT_ID',
  'GET_ELEMENT_TEXT',
  'GET_ELEMENT_ATTRIBUTE',
  'IS_ELEMENT_VISIBLE',
  'IS_ELEMENT_ENABLED',
  'IS_ELEMENT_CHECKED',
  'GET_ELEMENT_INNER_TEXT',
  'GET_ELEMENT_INNER_HTML',
  'GET_ELEMENT_INPUT_VALUE',
  'SET_ELEMENT_VALUE',
  'GET_ELEMENT_BOUNDING_BOX',
  'GET_ELEMENT_COUNT',
  'GET_ELEMENT_STYLES',
  'CLICK',
  'DBLCLICK',
  'HOVER',
  'FILL',
  'TYPE_TEXT',
  'PRESS_KEY',
  'SCROLL',
  'SELECT_OPTION',
  'CHECK',
  'UNCHECK',
  'FOCUS',
  'CLEAR',
  'SELECT_ALL',
  'SCROLL_INTO_VIEW',
  'DISPATCH_EVENT',
  'HIGHLIGHT',
  'TAP_TOUCH',
  'RECORDING_START',
  'RECORDING_ADD_FRAME',
  'RECORDING_STOP',
  'RECORDING_RESTART',
  'GET_LAST_RECORDING_FRAMES',
  'TAKE_SCREENSHOT',
  'GET_SNAPSHOT',
  'ENSURE_TAB_STATE',
  'UPDATE_TAB_STATE',
  'GET_STORAGE',
  'SET_STORAGE',
  'CLEAR_STORAGE',
])

const browserUseInputSchema = z.looseObject({
  action: browserUseActionSchema.describe('Browser-use action to dispatch'),
  tabId: z.number().int().nonnegative().optional().describe('Optional target tab id, defaults to active tab'),
})

export const browserUseTool = tool({
  title: 'browser-use',
  description: 'Dispatch browser-use actions to automate the current or specified tab. Includes high-privilege SEND_CDP.',
  inputSchema: browserUseInputSchema,
  execute: async (input, { experimental_context }) => {
    const { getActiveTabId } = (experimental_context ?? {}) as AgentContext
    if (typeof getActiveTabId !== 'function') {
      return { ok: false, error: 'No active-tab resolver available in context' }
    }

    const tabId = input.tabId ?? await getActiveTabId()
    if (!Number.isInteger(tabId) || tabId < 0) {
      return { ok: false, error: `Invalid tab id: ${tabId}` }
    }
    const { tabId: _tabId, ...commandInput } = input
    const command = {
      id: crypto.randomUUID(),
      typeId: tabId,
      ...commandInput,
    } as Command

    try {
      const data = await dispatchAction(command)
      return { ok: true, data: truncateLargeStrings(data) }
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})
