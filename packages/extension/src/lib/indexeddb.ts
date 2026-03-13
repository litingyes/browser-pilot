import type { Table } from 'dexie'
import { Dexie } from 'dexie'

export interface Skill {
  id: string
  name: string
  description: string
  files: IFsJSON
  builtin: boolean
  createdAt: number
  updatedAt: number
}

export interface IFsJSON {
  [path: string]: {
    type: 'file' | 'dir'
    content?: string
    mode?: number
  }
}

class SkillsDatabase extends Dexie {
  skills!: Table<Skill>

  constructor() {
    super('browser-pilot')
    this.version(1).stores({
      skills: 'id, name',
    })
  }
}

export const db = new SkillsDatabase()
