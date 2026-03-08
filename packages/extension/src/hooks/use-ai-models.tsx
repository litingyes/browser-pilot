import type { AiModelId } from '@/lib/ai-provider'
import type { AI_MODELS } from '@/stores/ai-models'
import { useStore } from '@tanstack/react-store'
import { useMemo } from 'react'
import { aiModelsStore } from '@/stores/ai-models'

export function useAiModels() {
  const aiModels = useStore(aiModelsStore, state => state)

  const setAiModel = (key: keyof AI_MODELS, value: string) => {
    aiModelsStore.setState(prev => ({ ...prev, [key]: value }))
  }

  const modelForSidepanelChat = useMemo(() => aiModels['sidepanel:chat'] as AiModelId, [aiModels])

  return {
    aiModels,

    setAiModel,

    modelForSidepanelChat,
  }
}
