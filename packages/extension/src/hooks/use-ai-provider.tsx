import type { AiGateway } from './use-ai-gateway'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export function useAiProvider(aiGateway: AiGateway) {
  const provider = useMemo(() => {
    if (aiGateway.provider === 'openai-compatible') {
      return createOpenAI({
        apiKey: aiGateway.apiKey,
        baseURL: aiGateway.baseURL,
      })
    }
    else if (aiGateway.provider === 'openai') {
      return createOpenAI({
        apiKey: aiGateway.apiKey,
      })
    }
    else if (aiGateway.provider === 'openrouter') {
      return createOpenRouter({
        apiKey: aiGateway.apiKey,
      })
    }
    else if (aiGateway.provider === 'anthropic') {
      return createAnthropic({
        apiKey: aiGateway.apiKey,
      })
    }
    else if (aiGateway.provider === 'deepseek') {
      return createDeepSeek({
        apiKey: aiGateway.apiKey,
      })
    }
  }, [aiGateway])

  return {
    provider,
  }
}
