import { storage } from '#imports'
import { AI_GATEWAY_STORAGE_KEY } from '@/stores/ai-gateways'

export default defineBackground(() => {
  if (import.meta.env.DEV) {
    storage.setItem(AI_GATEWAY_STORAGE_KEY, [
      {
        provider: 'deepseek',
        apiKey: import.meta.env.WXT_DEEPSEEK_API_KEY,
        models: import.meta.env.WXT_DEEPSEEK_MODELS?.split(',') ?? [],
      },
      {
        provider: 'openai-compatible',
        apiKey: import.meta.env.WXT_BAISHAN_API_KEY,
        baseURL: import.meta.env.WXT_BAISHAN_BASE_URL,
        models: import.meta.env.WXT_BAISHAN_MODELS?.split(',') ?? [],
      },
    ])
  }
})
