import type { ModelSelectorTriggerProps } from '@/components/assistant-ui/model-selector'
import { ModelSelector } from '@/components/assistant-ui/model-selector'
import { useAiGateway } from '@/hooks/use-ai-gateway'
import { parseAiModelId } from '@/lib/ai-provider'
import { ModelSelectorLogo } from '../ai-elements/model-selector'

interface AiModelSelectorProps {
  value: string
  size: ModelSelectorTriggerProps['size']
  onValueChange: (model: string) => void
}

export default function AiModelSelector({ value, size = 'sm', onValueChange }: AiModelSelectorProps) {
  const { aiModelIds } = useAiGateway()

  return (
    <ModelSelector
      value={value}
      models={aiModelIds.map(id => ({ id, name: parseAiModelId(id).modelName, icon: <ModelSelectorLogo provider={parseAiModelId(id).providerId} /> }))}
      onValueChange={onValueChange}
      size={size}
    />
  )
}
