import type { AI_MODELS } from '@/stores/ai-models'
import { storage } from '#imports'
import { AI_GATEWAY_STORAGE_KEY } from '@/stores/ai-gateways'
import { AI_MODELS_STORAGE_KEY } from '@/stores/ai-models'

export function initStoragesForDevelopment() {
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
  ])

  storage.setItem(AI_MODELS_STORAGE_KEY, {
    'sidepanel:chat': `openai-compatible:baishan/${import.meta.env.WXT_BAISHAN_MODELS?.split(',')?.[0]}`,
  } as AI_MODELS)
}
