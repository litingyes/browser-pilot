import type { AI_MODELS } from '@/stores/ai-models'
import { storage } from '#imports'
import { initBrowserUsePolicy } from '@/lib/browser-use-policy'
import { initBuiltinSkills } from '@/lib/builtin-skills'
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

export default defineBackground(() => {
  initBrowserUsePolicy().catch((error) => {
    console.error('Failed to initialize browser-use policy:', error)
  })

  initBuiltinSkills().catch((error) => {
    console.error('Failed to initialize builtin skills:', error)
  })

  if (import.meta.env.DEV) {
    initStoragesForDevelopment()
  }
})
