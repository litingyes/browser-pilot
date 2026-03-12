import type { AiModelId } from '@/lib/ai-provider'
import type { AiGateway } from '@/stores/ai-gateways'
import { useStore } from '@tanstack/react-store'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { AI_GATEWAYS_SCHEMA, aiGatewaysStore, getAiGatewayId } from '@/stores/ai-gateways'

export interface AiGatewayModel {
  id: AiModelId
  name: string
  provider: AiGateway['provider']
}

export function useAiGateway() {
  const aiGateways = useStore(aiGatewaysStore, state => state)

  const getAiGateway = (provider: AiGateway['provider'], providerAlias?: string) => {
    return aiGateways.find((g) => {
      if (provider !== g.provider) {
        return false
      }
      if (provider === 'openai-compatible') {
        return g.providerAlias === providerAlias
      }
      return true
    })
  }

  const setAiGatewaysWithValidation = (nextAiGateways: AiGateway[]) => {
    const parsed = AI_GATEWAYS_SCHEMA.safeParse(nextAiGateways)
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]
      toast.error(firstIssue?.message ?? 'Invalid AI gateway config')
      return false
    }

    aiGatewaysStore.setState(() => nextAiGateways)
    return true
  }

  const addAiGateway = (aiGateway: AiGateway) => {
    if (aiGateway.provider !== 'openai-compatible' && aiGateways.some(g => g.provider === aiGateway.provider)) {
      toast.error('Provider already exists')
      return false
    }

    return setAiGatewaysWithValidation([...aiGateways, aiGateway])
  }

  const removeAiGateway = (aiGateway: AiGateway) => {
    const removedId = getAiGatewayId(aiGateway)
    const nextAiGateways = aiGateways.filter(g => getAiGatewayId(g) !== removedId)
    return setAiGatewaysWithValidation(nextAiGateways)
  }

  const updateAiGateway = (oldAiGateway: AiGateway, nextAiGateway: AiGateway) => {
    const oldId = getAiGatewayId(oldAiGateway)
    const nextAiGateways = aiGateways.map(g => getAiGatewayId(g) === oldId ? nextAiGateway : g)
    return setAiGatewaysWithValidation(nextAiGateways)
  }

  const aiModelIds = useMemo<AiModelId[]>(
    () =>
      aiGateways.flatMap((aiGateway) => {
        const providerKey = aiGateway.provider === 'openai-compatible'
          ? `${aiGateway.provider}:${aiGateway.providerAlias}`
          : aiGateway.provider

        return aiGateway.models.map(model => `${providerKey}/${model}` as AiModelId)
      }),
    [aiGateways],
  )

  return {
    aiGateways,

    getAiGateway,

    addAiGateway,
    removeAiGateway,
    updateAiGateway,

    aiModelIds,
  }
}
