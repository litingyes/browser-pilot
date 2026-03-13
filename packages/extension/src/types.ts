import type { Skill } from '@/lib/indexeddb'

export interface AgentContext {
  skills: Skill[]
  getActiveTabId: () => Promise<number>
}
