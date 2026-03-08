import type { AiModelId } from '@/lib/ai-provider'
import type { AiGateway } from '@/stores/ai-gateways'
import { useStore } from '@tanstack/react-store'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { aiGatewaysStore } from '@/stores/ai-gateways'

export interface AiGatewayModel {
  id: `${AiGateway['provider']}/${string}`
  name: string
  provider: AiGateway['provider']
}

export function useAiGateway() {
  const aiGateways = useStore(aiGatewaysStore, state => state)

  const getAiGateway = (provider: AiGateway['provider']) => {
    return aiGateways.find(g => g.provider === provider)
  }

  const addAiGateway = (aiGateway: AiGateway) => {
    const provider = aiGateways.find(g => g.provider === aiGateway.provider)
    if (provider) {
      toast.error('Provider already exists')
      return
    }

    aiGatewaysStore.setState(prev => [...prev, aiGateway])
  }
  const removeAiGateway = (provider: AiGateway['provider']) => {
    aiGatewaysStore.setState(prev => prev.filter(g => g.provider !== provider))
  }
  const updateAiGateway = (aiGateway: AiGateway) => {
    aiGatewaysStore.setState(prev => prev.map(g => g.provider === aiGateway.provider ? aiGateway : g))
  }

  const aiModelIds = useMemo<AiModelId[]>(
    () => aiGateways.flatMap(aiGateway => aiGateway.models.map(model => `${aiGateway.provider}/${model}` as AiModelId)),
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
