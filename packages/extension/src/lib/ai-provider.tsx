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
      const parsedAiModelId = parseAiModelId(modelId)
      const provider = getAiProvider(parsedAiModelId)!

      if (parsedAiModelId.providerId === 'openai-compatible') {
        return wrapLanguageModel({
          model: provider.languageModel(parsedAiModelId.modelName),
          middleware: extractReasoningMiddleware({
            tagName: 'think',
            separator: '\n',
            startWithReasoning: false,
          }),
        })
      }

      return provider.languageModel(parsedAiModelId.modelName)
    },
    embeddingModel(modelId: AiModelId) {
      const parsedAiModelId = parseAiModelId(modelId)
      const provider = getAiProvider(parsedAiModelId)!

      return provider.embeddingModel(parsedAiModelId.modelName)
    },
    imageModel(modelId: AiModelId) {
      const parsedAiModelId = parseAiModelId(modelId)
      const provider = getAiProvider(parsedAiModelId)!

      return provider.imageModel(parsedAiModelId.modelName)
    },
  }
}

function getAiProvider(model: ParsedAiModelId) {
  const aiGateway = aiGatewaysStore.get().find((aiGateway) => {
    if (aiGateway.provider !== model.providerId) {
      return false
    }
    if (aiGateway.provider === 'openai-compatible') {
      return aiGateway.providerAlias === model.providerAlias
    }
    return true
  })

  if (!aiGateway) {
    throw new Error(`AI Gateway not found for model id: ${model.rawModelId}`)
  }

  if (aiGateway.provider === 'openai-compatible') {
    return createOpenAICompatible({
      name: aiGateway.providerAlias!,
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

export type OpenAICompatibleProviderId = `openai-compatible:${string}`
export type AiProviderId = Exclude<AiGateway['provider'], 'openai-compatible'> | OpenAICompatibleProviderId
export type AiModelId = `${AiProviderId}/${string}`

interface ParsedAiModelId {
  providerId: AiGateway['provider']
  providerAlias?: string
  providerName: string
  modelName: string
  rawModelId: string
}

export function parseAiModelId(modelId: AiModelId) {
  const i = modelId.indexOf('/')
  if (i === -1) {
    throw new Error(`Invalid AI model ID: ${modelId}`)
  }

  const providerPart = modelId.slice(0, i)
  const modelName = modelId.slice(i + 1)

  if (providerPart.startsWith('openai-compatible:')) {
    const providerAlias = providerPart.slice('openai-compatible:'.length)
    if (!providerAlias) {
      throw new Error(`Invalid AI model ID: ${modelId}`)
    }

    return {
      providerId: 'openai-compatible' as const,
      providerAlias,
      providerName: providerAlias,
      modelName,
      rawModelId: modelId,
    } satisfies ParsedAiModelId
  }

  return {
    providerId: providerPart as AiGateway['provider'],
    providerName: providerPart,
    modelName,
    rawModelId: modelId,
  } satisfies ParsedAiModelId
}

export function formatAiModelId(aiGateway: AiGateway, modelName: string): AiModelId {
  if (aiGateway.provider === 'openai-compatible') {
    return `openai-compatible:${aiGateway.providerAlias}/${modelName}`
  }

  return `${aiGateway.provider}/${modelName}`
}
