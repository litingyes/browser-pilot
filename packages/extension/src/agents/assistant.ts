import type { AiModelId } from '@/lib/ai-provider'
import { ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { createAiProvider } from '@/lib/ai-provider'

export const assistant = new ToolLoopAgent({
  id: 'Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'default',
  callOptionsSchema: z.object({
    model: z.string(),
  }),
  prepareCall: ({ options, ...settings }) => {
    return {
      ...settings,
      model: createAiProvider().languageModel(options.model as AiModelId),
    }
  },
})
