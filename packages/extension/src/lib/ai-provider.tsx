import type { ProviderV3 } from '@ai-sdk/provider'
import type { AiGateway } from '@/stores/ai-gateways'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { extractReasoningMiddleware, wrapLanguageModel } from 'ai'
import { aiGatewaysStore } from '@/stores/ai-gateways'

export function createAiProvider(): ProviderV3 {
  return {
    specificationVersion: 'v3',
    languageModel(modelId: AiModelId) {
      const { providerId, modelName } = parseAiModelId(modelId)
      const provider = getAiProvider(providerId)!

      if (providerId === 'openai-compatible') {
        return wrapLanguageModel({
          model: provider.languageModel(modelName),
          middleware: extractReasoningMiddleware({
            tagName: 'think',
            separator: '\n',
            startWithReasoning: true,
          }),
        })
      }

      return provider.languageModel(modelName)
    },
    embeddingModel(modelId: AiModelId) {
      const { providerId, modelName } = parseAiModelId(modelId)
      const provider = getAiProvider(providerId as AiGateway['provider'])!

      return provider.embeddingModel(modelName)
    },
    imageModel(modelId: AiModelId) {
      const { providerId, modelName } = parseAiModelId(modelId)
      const provider = getAiProvider(providerId as AiGateway['provider'])!

      return provider.imageModel(modelName)
    },
  }
}

function getAiProvider(providerId: AiGateway['provider']) {
  const aiGateway = aiGatewaysStore.get().find(aiGateway => aiGateway.provider === providerId)!

  if (aiGateway.provider === 'openai-compatible') {
    return createOpenAICompatible({
      name: aiGateway.provider,
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
}

export type AiModelId = `${AiGateway['provider']}/${string}`
export function parseAiModelId(modelId: AiModelId) {
  const i = modelId.indexOf('/')
  if (i === -1) {
    throw new Error(`Invalid AI model ID: ${modelId}`)
  }

  return {
    providerId: modelId.slice(0, i) as AiGateway['provider'],
    modelName: modelId.slice(i + 1),
  }
}
