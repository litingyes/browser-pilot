import type { AgentContext } from '@/types'
import { tool } from 'ai'
import { z } from 'zod'
import { getSkillContent } from '@/lib/skills'

export const skillLoadTool = tool({
  title: 'skill-load',
  description: 'Load a skill to get specialized instructions for a task',
  inputSchema: z.object({
    name: z.string().describe('The skill name to load'),
  }),
  execute: async (
    { name },
    { experimental_context },
  ) => {
    const { skills } = (experimental_context ?? {}) as AgentContext
    if (!skills?.length)
      return { error: 'No skills available' }

    const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
    if (!skill)
      return { error: `Skill '${name}' not found` }

    const result = getSkillContent(skill)
    return result
  },
})
