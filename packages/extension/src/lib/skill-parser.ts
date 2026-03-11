import { remark } from 'remark'
import remarkFrontmatter from 'remark-frontmatter'

export interface ParsedSkillMeta {
  name: string
  description: string
}

export async function parseSkillMeta(content: string): Promise<ParsedSkillMeta> {
  const result = await remark()
    .use(remarkFrontmatter)
    .parse(content)

  for (const node of result.children) {
    if (node.type === 'yaml' && 'value' in node && typeof node.value === 'string') {
      const frontmatter = node.value
      const lines = frontmatter.split('\n')

      let name = 'Unknown'
      let description = ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('name:')) {
          name = trimmed.slice(5).trim() || 'Unknown'
        }
        else if (trimmed.startsWith('description:')) {
          description = trimmed.slice(12).trim()
        }
      }

      return { name, description }
    }
  }

  return { name: 'Unknown', description: '' }
}
