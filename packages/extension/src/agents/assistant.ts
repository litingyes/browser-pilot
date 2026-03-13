import type { Command, SendCdpCommand } from '@/browser-use/types'
import type { AiModelId } from '@/lib/ai-provider'
import type { Skill } from '@/lib/indexeddb'
import { tool, ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { dispatchAction } from '@/browser-use'
import { createAiProvider } from '@/lib/ai-provider'
import { getBrowserUsePolicy } from '@/lib/browser-use-policy'
import { buildSkillsPrompt, getSkillContent } from '@/lib/skills'

const browserUseActionSchema = z.enum([
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
  confirmSensitiveAction: z.boolean().optional().describe('Required for sensitive actions when policy requests confirmation'),
})

interface AssistantContext {
  skills: Skill[]
  getActiveTabId: () => Promise<number>
}

const ALWAYS_BLOCKED_TAB_URL_PREFIXES = [
  'chrome://',
  'edge://',
  'about:',
  'devtools://',
  'chrome-extension://',
  'moz-extension://',
]

function isBlockedCdpMethod(method: string, blockedMethods: string[], blockedPrefixes: string[]) {
  if (blockedMethods.includes(method)) {
    return true
  }

  return blockedPrefixes.some(prefix => method.startsWith(prefix))
}

function isSafeNavigateUrl(url: string, allowedProtocols: string[]) {
  try {
    const parsed = new URL(url)
    return allowedProtocols.includes(parsed.protocol)
  }
  catch {
    return false
  }
}

async function assertTabIsSafeTarget(tabId: number, blockedPrefixes: string[]) {
  const tab = await browser.tabs.get(tabId)
  if (!tab) {
    throw new Error(`Target tab ${tabId} not found`)
  }

  if (!tab.url) {
    return
  }

  const lowerUrl = tab.url.toLowerCase()
  const effectiveBlockedPrefixes = [...new Set([...ALWAYS_BLOCKED_TAB_URL_PREFIXES, ...blockedPrefixes])]
  if (effectiveBlockedPrefixes.some(prefix => lowerUrl.startsWith(prefix))) {
    throw new Error(`Target tab ${tabId} is not allowed for automation`)
  }
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

    const policy = await getBrowserUsePolicy()

    if (typeof input.tabId === 'number' && !policy.allowAgentTabIdOverride) {
      return {
        ok: false,
        error: 'Policy denied tabId override. Use active tab or update preferences.',
      }
    }

    const tabId = input.tabId ?? await getActiveTabId()
    if (!Number.isInteger(tabId) || tabId < 0) {
      return { ok: false, error: `Invalid tab id: ${tabId}` }
    }
    try {
      await assertTabIsSafeTarget(tabId, policy.blockTabUrlPrefixes)
    }
    catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      }
    }

    if (input.action === 'SEND_CDP') {
      const command = input as SendCdpCommand

      const method = typeof command.method === 'string' ? command.method.trim() : ''
      if (!method) {
        return { ok: false, error: 'SEND_CDP requires a non-empty method' }
      }

      if (isBlockedCdpMethod(method, policy.blockMethods, policy.blockMethodPrefixes)) {
        return { ok: false, error: `CDP method is blocked by policy: ${method}` }
      }

      if (policy.requireConfirmationForSendCdp && input.confirmSensitiveAction !== true) {
        const { confirmSensitiveAction: _confirmSensitiveAction, ...restInput } = input
        return {
          ok: false,
          interrupted: true,
          error: `Sensitive action "${method}" requires confirmation`,
          nextStep: 'Ask user for confirmation, then retry with confirmSensitiveAction=true or update preferences policy.',
          retryInput: {
            ...restInput,
            confirmSensitiveAction: true,
          },
        }
      }

      if (method === 'Page.navigate') {
        const params = (command.params ?? {}) as Record<string, unknown>
        const url = typeof params.url === 'string' ? params.url : ''
        if (!isSafeNavigateUrl(url, policy.allowedNavigateProtocols)) {
          return { ok: false, error: `Blocked navigation URL: ${url || 'empty'}` }
        }
      }
    }

    const { tabId: _tabId, confirmSensitiveAction: _confirmSensitiveAction, ...commandInput } = input
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
  instructions: `You are a helpful assistant.

When browserUseDispatch returns { interrupted: true, retryInput }, ask the user for confirmation in natural language.
If the user confirms, retry browserUseDispatch immediately using retryInput without asking the user to provide technical flags.`,
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
