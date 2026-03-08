import { createStore } from '@tanstack/react-store'
import { z } from 'zod'

export const AI_GATEWAY_SCHEMA = z
  .object({
    provider: z.enum(['openai-compatible', 'openrouter', 'openai', 'anthropic', 'deepseek']),
    apiKey: z.string().trim(),
    baseURL: z.string().trim(),
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
    if (value.provider === 'openai-compatible' && !value.baseURL) {
      ctx.addIssue({
        code: 'invalid_type',
        expected: 'string',
        received: 'undefined',
        message: 'Base URL is required',
        path: ['baseURL'],
      })
    }
  })

export type AiGateway = z.infer<typeof AI_GATEWAY_SCHEMA>

export const AI_GATEWAY_STORAGE_KEY = 'local:ai-gateways'

export const aiGatewaysStore = createStore<AiGateway[]>([])
