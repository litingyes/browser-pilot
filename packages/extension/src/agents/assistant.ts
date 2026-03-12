import type { AiModelId } from '@/lib/ai-provider'
import type { Skill } from '@/lib/indexeddb'
import { tool, ToolLoopAgent } from 'ai'
import { z } from 'zod'
import { createAiProvider } from '@/lib/ai-provider'
import { buildSkillsPrompt, getSkillContent } from '@/lib/skills'

const loadSkillTool = tool({
  description: 'Load a skill to get specialized instructions for a task',
  inputSchema: z.object({
    name: z.string().describe('The skill name to load'),
  }),
  execute: async (
    { name },
    { experimental_context },
  ) => {
    const { skills } = (experimental_context ?? {}) as { skills: Skill[] }
    if (!skills?.length)
      return { error: 'No skills available' }

    const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (!skill)
      return { error: `Skill '${name}' not found` }

    const result = getSkillContent(skill)
    return result
  },
})

export const assistant = new ToolLoopAgent({
  id: 'Assistant',
  instructions: 'You are a helpful assistant.',
  model: 'default',
  tools: {
    loadSkill: loadSkillTool,
  },
  callOptionsSchema: z.object({
    getModel: z.function({
      output: z.string(),
    }),
    getSkills: z.function({
      output: z.promise(z.array(z.any())),
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
      },
    }
  },
})
