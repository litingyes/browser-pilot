import type { AiModelId } from '@/lib/ai-provider'
import { ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { createAiProvider } from '@/lib/ai-provider'

export const assistant = new ToolLoopAgent({
  id: 'Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'default',
  callOptionsSchema: z.object({
    getModel: z.function({
      output: z.string(),
    }),
  }),
  prepareCall: ({ options, ...settings }) => {
    return {
      ...settings,
      model: createAiProvider().languageModel(options.getModel() as AiModelId),
    }
  },
})
