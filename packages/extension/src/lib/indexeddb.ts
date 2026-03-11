import type { Table } from 'dexie'
import { Dexie } from 'dexie'

export interface Skill {
  name: string
  description: string
  computedHash: string
  createdAt: number
  updatedAt: number
  files: IFsJSON
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
      skills: 'name, createdAt, updatedAt',
    })
  }
}

export const db = new SkillsDatabase()
