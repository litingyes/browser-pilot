import { createStore } from '@tanstack/react-store'
import { z } from 'zod'

export const AI_MODELS_SCHEMA = z.object({
  'sidepanel:chat': z.string(),
})

export type AI_MODELS = z.infer<typeof AI_MODELS_SCHEMA>

export const AI_MODELS_STORAGE_KEY = 'local:ai-models'

export const aiModelsStore = createStore<AI_MODELS>({
  'sidepanel:chat': '',
})
