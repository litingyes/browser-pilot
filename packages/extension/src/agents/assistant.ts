import type { AiModelId } from '@/lib/ai-provider'
import type { Skill } from '@/lib/indexeddb'
import { ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { createAiProvider } from '@/lib/ai-provider'
import { buildSkillsPrompt } from '@/lib/skills'
import { browserUseTool } from '@/tools/browser-use'
import { skillLoadTool } from '@/tools/load-skill'

export const assistant = new ToolLoopAgent({
  id: 'Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'default',
  tools: {
    skill: skillLoadTool,
    browserUseDispatch: browserUseTool,
  },
  callOptionsSchema: z.object({
    getModel: z.function({
      output: z.string(),
    }),
    getSkills: z.function({
      output: z.promise(z.array(z.any())),
    }),
    getActiveTabId: z.function({
      output: z.promise(z.number().int().nonnegative()),
    }),
  }),
  prepareCall: async ({ options, ...settings }) => {
    const skills = (await options.getSkills()) as Skill[]
    const skillsPrompt = buildSkillsPrompt(skills)

    return {
      ...settings,
      model: createAiProvider().languageModel(options.getModel() as AiModelId),
      instructions: `${settings.instructions ?? ''}${skillsPrompt}`.trim(),
      experimental_context: {
        skills,
        getActiveTabId: options.getActiveTabId,
      },
    }
  },
})
