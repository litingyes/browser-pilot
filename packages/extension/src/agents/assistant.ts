import type { Command } from '@/browser-use/types'
import type { AiModelId } from '@/lib/ai-provider'
import type { Skill } from '@/lib/indexeddb'
import { tool, ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { dispatchAction } from '@/browser-use'
import { createAiProvider } from '@/lib/ai-provider'
import { buildSkillsPrompt, getSkillContent } from '@/lib/skills'

const browserUseActionSchema = z.enum([
  'NAVIGATE',
  'GET_URL',
  'GET_TITLE',
  'GET_CONTENT',
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

const browserUseDispatchInputSchema = z.object({
  action: browserUseActionSchema.describe('Browser-use action to dispatch'),
  tabId: z.number().int().nonnegative().optional().describe('Optional target tab id, defaults to active tab'),
  url: z.string().optional(),
  waitUntil: z.enum(['load', 'domcontentloaded', 'networkidle']).optional(),
  index: z.number().int().optional(),
  selectorOrRef: z.string().optional(),
  selector: z.string().optional(),
  method: z.string().optional(),
  params: z.record(z.string(), z.unknown()).optional(),
  button: z.enum(['left', 'right', 'middle']).optional(),
  clickCount: z.number().int().positive().optional(),
  value: z.string().optional(),
  text: z.string().optional(),
  clear: z.boolean().optional(),
  delayMs: z.number().int().nonnegative().optional(),
  key: z.string().optional(),
  options: z.object({
    selectorOrRef: z.string().optional(),
    deltaX: z.number(),
    deltaY: z.number(),
  }).optional(),
  values: z.array(z.string()).optional(),
  eventType: z.string().optional(),
  eventInit: z.record(z.string(), z.unknown()).optional(),
  path: z.string().optional(),
  frameData: z.any().optional(),
  storageType: z.enum(['local', 'session']).optional(),
  urls: z.array(z.string()).optional(),
  cookies: z.array(z.record(z.string(), z.unknown())).optional(),
  currentUrl: z.string().optional(),
  attribute: z.string().optional(),
  input: z.string().optional(),
  properties: z.array(z.string()).optional(),
  state: z.record(z.string(), z.unknown()).optional(),
  quality: z.number().int().min(0).max(100).optional(),
  fullPage: z.boolean().optional(),
}).passthrough()

interface AssistantContext {
  skills: Skill[]
  getActiveTabId: () => Promise<number>
}

const loadSkillTool = tool({
  description: 'Load a skill to get specialized instructions for a task',
  inputSchema: z.object({
    name: z.string().describe('The skill name to load'),
  }),
  execute: async (
    { name },
    { experimental_context },
  ) => {
    const { skills } = (experimental_context ?? {}) as AssistantContext
    if (!skills?.length)
      return { error: 'No skills available' }

    const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (!skill)
      return { error: `Skill '${name}' not found` }

    const result = getSkillContent(skill)
    return result
  },
})

const browserUseDispatchTool = tool({
  description: 'Dispatch browser-use actions to automate the current or specified tab. Includes high-privilege SEND_CDP.',
  inputSchema: browserUseDispatchInputSchema,
  execute: async (input, { experimental_context }) => {
    const { getActiveTabId } = (experimental_context ?? {}) as AssistantContext
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
      return { ok: true, data }
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }
  },
})

export const assistant = new ToolLoopAgent({
  id: 'Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'default',
  tools: {
    loadSkill: loadSkillTool,
    browserUseDispatch: browserUseDispatchTool,
  },
  callOptionsSchema: z.object({
    getModel: z.function({
      output: z.string(),
    }),
    getSkills: z.function({
      output: z.promise(z.array(z.any())),
    }),
    getActiveTabId: z.function({
      output: z.promise(z.number().int().nonnegative()),
    }),
  }),
  prepareCall: async ({ options, ...settings }) => {
    const skills = (await options.getSkills()) as Skill[]
    const skillsPrompt = buildSkillsPrompt(skills)

    return {
      ...settings,
      model: createAiProvider().languageModel(options.getModel() as AiModelId),
      instructions: `${settings.instructions ?? ''}${skillsPrompt}`.trim(),
      experimental_context: {
        skills,
        getActiveTabId: options.getActiveTabId,
      },
    }
  },
})
