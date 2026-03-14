import type { AI_MODELS } from '@/stores/ai-models'
import { storage } from '#imports'
import { detachDebugger } from '@/browser-use/debugger'
import { removeTabState } from '@/browser-use/state'
import { computeHash } from '@/lib/hash'
import { db } from '@/lib/indexeddb'
import { unzip } from '@/lib/zip'
import { AI_GATEWAY_STORAGE_KEY } from '@/stores/ai-gateways'
import { AI_MODELS_STORAGE_KEY } from '@/stores/ai-models'

const BUILTIN_SKILL_ZIP_URL = '/skills/built-in.zip'
const BUILTIN_SKILL_DEFAULT_NAME = 'built-in-browser-automation'
const BUILTIN_SKILL_DEFAULT_DESCRIPTION = 'Drive browser tabs with dispatchAction for navigation, tab orchestration, snapshotting, element queries/interactions, visual capture, cookies/storage, debugger CDP access, and lightweight session recording. Use when tasks require direct browser automation in the current Chrome tab context.'

function initStoragesForDevelopment() {
  storage.setItem(AI_GATEWAY_STORAGE_KEY, [
    {
      provider: 'deepseek',
      apiKey: import.meta.env.WXT_DEEPSEEK_API_KEY,
      models: import.meta.env.WXT_DEEPSEEK_MODELS?.split(',') ?? [],
    },
    {
      provider: 'openai-compatible',
      providerAlias: 'baishan',
      apiKey: import.meta.env.WXT_BAISHAN_API_KEY,
      baseURL: import.meta.env.WXT_BAISHAN_BASE_URL,
      models: import.meta.env.WXT_BAISHAN_MODELS?.split(',') ?? [],
    },
    {
      provider: 'openai-compatible',
      providerAlias: 'ark',
      apiKey: import.meta.env.WXT_ARK_API_KEY,
      baseURL: import.meta.env.WXT_ARK_BASE_URL,
      models: import.meta.env.WXT_ARK_MODELS?.split(',') ?? [],
    },
  ])

  storage.setItem(AI_MODELS_STORAGE_KEY, {
    'sidepanel:chat': `openai-compatible:ark/${import.meta.env.WXT_ARK_MODELS?.split(',')?.[0]}`,
  } as AI_MODELS)
}

function extractBuiltinSkillMeta(files: Awaited<ReturnType<typeof unzip>>) {
  const skillDoc = files['SKILL.md']?.content ?? ''
  let parsedName = ''
  let parsedDescription = ''

  for (const line of skillDoc.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('name:') && !parsedName) {
      parsedName = trimmed.slice('name:'.length).trim()
      continue
    }
    if (trimmed.startsWith('description:') && !parsedDescription) {
      parsedDescription = trimmed.slice('description:'.length).trim()
    }
  }

  return {
    description: parsedDescription || BUILTIN_SKILL_DEFAULT_DESCRIPTION,
    name: parsedName || BUILTIN_SKILL_DEFAULT_NAME,
  }
}

async function initBuiltinSkills() {
  try {
    const response = await fetch(BUILTIN_SKILL_ZIP_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch built-in skills zip: ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const files = await unzip(arrayBuffer)
    const id = await computeHash(files)
    const { name, description } = extractBuiltinSkillMeta(files)
    const existingSkill = await db.skills.get({ name })

    if (existingSkill && existingSkill.id === id) {
      return
    }

    const now = Date.now()
    await db.skills.put({
      id,
      name,
      description,
      builtin: true,
      createdAt: now,
      updatedAt: now,
      files,
    })
  }
  catch (error) {
    console.error('Failed to initialize built-in skills', error)
  }
}

export default defineBackground({
  type: 'module',
  main() {
    initBuiltinSkills()

    browser.sidePanel.onClosed.addListener(async (info) => {
      if (info.tabId !== undefined) {
        await detachDebugger(info.tabId)
        return
      }

      const tabs = await browser.tabs.query({ windowId: info.windowId })
      await Promise.all(
        tabs
          .filter(tab => Number.isInteger(tab.id))
          .map(tab => detachDebugger(tab.id!)),
      )
    })

    browser.tabs.onRemoved.addListener((tabId) => {
      removeTabState(tabId)
    })

    if (import.meta.env.DEV) {
      initStoragesForDevelopment()
    }
  },
},
)
