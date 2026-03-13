import type { AI_MODELS } from '@/stores/ai-models'
import { storage } from '#imports'
import { computeHash } from '@/lib/hash'
import { db } from '@/lib/indexeddb'
import { unzip } from '@/lib/zip'
import { AI_GATEWAY_STORAGE_KEY } from '@/stores/ai-gateways'
import { AI_MODELS_STORAGE_KEY } from '@/stores/ai-models'

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

export default defineBackground({
  type: 'module',
  main() {
    fetch('/skills/built-in.zip').then(async (response) => {
      const arrayBuffer = await response.arrayBuffer()
      const files = await unzip(arrayBuffer)

      console.warn('files', files)

      const id = await computeHash(files)

      const existingSkill = await db.skills.get({ name: 'built-in-browser-automation' })

      if (existingSkill && existingSkill.id === id) {
        return
      }

      const now = Date.now()
      await db.skills.put({
        id,
        name: 'built-in-browser-automation',
        description: 'Drive browser tabs with dispatchAction for snapshotting, element queries, DOM interactions, storage management, cookie operations, debugger CDP access, and session recording. Use when tasks require direct browser automation, web page interaction, or tab control through the browser MCP server.',
        builtin: true,
        createdAt: now,
        updatedAt: now,
        files,
      })

      console.warn('Builtin skills initialized successfully')
    })

    if (import.meta.env.DEV) {
      initStoragesForDevelopment()
    }
  },
},
)
