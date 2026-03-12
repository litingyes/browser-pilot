import type { Skill } from '@/lib/indexeddb'
import { stripFrontmatter } from '@/lib/skill-parser'

export function buildSkillsPrompt(skills: Skill[]): string {
  if (skills.length === 0)
    return ''

  const skillsList = skills
    .map(s => `- ${s.name}: ${s.description}`)
    .join('\n')

  return `

## Skills

Use the \`loadSkill\` tool when the user's request would benefit from specialized instructions.

Available skills:
${skillsList}
`
}

export interface SkillContentResult {
  skillDirectory: string
  content: string
}

export function getSkillContent(skill: Skill): SkillContentResult | { error: string } {
  const skillMdPath = Object.keys(skill.files).find(path =>
    path.toLowerCase().endsWith('/skill.md'),
  )
  if (!skillMdPath)
    return { error: `Skill '${skill.name}' has no SKILL.md file` }

  const skillMd = skill.files[skillMdPath]
  if (!skillMd || skillMd.type !== 'file' || typeof skillMd.content !== 'string')
    return { error: `Skill '${skill.name}' SKILL.md has no content` }

  const content = stripFrontmatter(skillMd.content)
  const skillDirectory = skillMdPath.includes('/')
    ? skillMdPath.slice(0, skillMdPath.lastIndexOf('/'))
    : ''

  return { skillDirectory, content }
}
