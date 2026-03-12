import { createStore } from '@tanstack/react-store'
import { z } from 'zod'

export const AI_GATEWAY_SCHEMA = z
  .object({
    provider: z.enum(['openai-compatible', 'openrouter', 'openai', 'anthropic', 'deepseek']),
    providerAlias: z.string().trim().optional(),
    apiKey: z.string().trim(),
    baseURL: z.string().trim().optional(),
    models: z.array(z.string()),
  })
  .superRefine((value, ctx) => {
    if (!value.apiKey) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        message: 'API Key is required',
        path: ['apiKey'],
      })
    }
    if (!value.models?.length) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'array',
        received: 'undefined',
        message: 'At least one model is required',
        path: ['models'],
      })
    }
    if (value.provider === 'openai-compatible') {
      if (!value.providerAlias) {
        ctx.addIssue({
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Provider alias is required',
          path: ['providerAlias'],
        })
      }

      if (!value.baseURL) {
        ctx.addIssue({
          code: 'invalid_type',
          expected: 'string',
          received: 'undefined',
          message: 'Base URL is required',
          path: ['baseURL'],
        })
      }
    }
  })

export type AiGateway = z.infer<typeof AI_GATEWAY_SCHEMA>

export function getAiGatewayDisplayName(aiGateway: AiGateway) {
  return aiGateway.provider === 'openai-compatible'
    ? aiGateway.providerAlias ?? ''
    : aiGateway.provider
}

export function getAiGatewayId(aiGateway: AiGateway) {
  return aiGateway.provider === 'openai-compatible'
    ? `${aiGateway.provider}:${aiGateway.providerAlias ?? ''}`
    : aiGateway.provider
}

export const AI_GATEWAYS_SCHEMA = z.array(AI_GATEWAY_SCHEMA).superRefine((value, ctx) => {
  const displayNameToIndexes = new Map<string, number[]>()

  value.forEach((aiGateway, index) => {
    const displayName = getAiGatewayDisplayName(aiGateway)
    const indexes = displayNameToIndexes.get(displayName) ?? []
    displayNameToIndexes.set(displayName, [...indexes, index])
  })

  for (const [displayName, indexes] of displayNameToIndexes.entries()) {
    if (!displayName || indexes.length <= 1) {
      continue
    }

    indexes.forEach((index) => {
      ctx.addIssue({
        code: 'custom',
        message: `Provider name '${displayName}' already exists`,
        path: [index, 'providerAlias'],
      })
    })
  }
})

export const AI_GATEWAY_STORAGE_KEY = 'local:ai-gateways'

export const aiGatewaysStore = createStore<AiGateway[]>([])
