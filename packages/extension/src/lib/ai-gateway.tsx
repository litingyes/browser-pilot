import type { ReactElement } from 'react'
import type { AiGateway } from '@/stores/ai-gateways'
import { BrainCircuitIcon } from 'lucide-react'
import { AnthropicBlack } from '@/components/ui/svgs/anthropicBlack'
import { Deepseek } from '@/components/ui/svgs/deepseek'
import { Openai } from '@/components/ui/svgs/openai'
import { OpenrouterLight } from '@/components/ui/svgs/openrouterLight'

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
