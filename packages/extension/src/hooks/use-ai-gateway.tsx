import type { ReactElement } from 'react'
import { storage } from '#imports'
import { BrainCircuitIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import { AnthropicBlack } from '@/components/ui/svgs/anthropicBlack'
import { Deepseek } from '@/components/ui/svgs/deepseek'
import { Openai } from '@/components/ui/svgs/openai'
import { OpenrouterLight } from '@/components/ui/svgs/openrouterLight'

export const aiGatewaySchema = z
  .object({
    provider: z.enum(['openai-compatible', 'openrouter', 'openai', 'anthropic', 'deepseek']),
    apiKey: z.string().trim(),
    baseURL: z.string().trim(),
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

export type AiGateway = z.infer<typeof aiGatewaySchema>

export const STORAGE_KEY = 'local:ai-gateways'

export const AI_GATEWAY_METADATA: Record<AiGateway['provider'], {
  icon: ReactElement
}> = {
  'openai-compatible': {
    icon: <BrainCircuitIcon />,
  },
  'openai': {
    icon: <Openai />,
  },
  'openrouter': {
    icon: <OpenrouterLight />,
  },
  'anthropic': {
    icon: <AnthropicBlack />,
  },
  'deepseek': {
    icon: <Deepseek />,
  },
}

export function useAiGateway() {
  const [aiGateways, setAiGateways] = useState<AiGateway[]>([])

  const refreshAiGateways = () => {
    return storage.getItem(STORAGE_KEY).then((value) => {
      if (!value) {
        setAiGateways([])
      }
      else {
        setAiGateways(value as AiGateway[])
      }
    })
  }
  useEffect(() => {
    refreshAiGateways()

    storage.watch(STORAGE_KEY, (value) => {
      setAiGateways(value as AiGateway[])
    })
  }, [])

  const getAiGateway = (provider: AiGateway['provider']) => {
    return aiGateways.find(g => g.provider === provider)
  }

  const addAiGateway = (aiGateway: AiGateway) => {
    const provider = aiGateways.find(g => g.provider === aiGateway.provider)
    if (provider) {
      toast.error('Provider already exists')
      return
    }

    return storage.setItem(STORAGE_KEY, [...aiGateways, aiGateway]).then(() => {
      toast.success(`AI Gateway ${aiGateway.provider} added`)
    }).catch(() => {
      toast.error('Failed to add AI Gateway')
    })
  }
  const removeAiGateway = (provider: string) => {
    return storage.setItem(STORAGE_KEY, aiGateways.filter(g => g.provider !== provider))
  }
  const updateAiGateway = (aiGateway: AiGateway) => {
    return storage.setItem(STORAGE_KEY, aiGateways.map(g => g.provider === aiGateway.provider ? aiGateway : g))
  }

  return {
    aiGateways,

    getAiGateway,

    addAiGateway,
    removeAiGateway,
    updateAiGateway,
  }
}
