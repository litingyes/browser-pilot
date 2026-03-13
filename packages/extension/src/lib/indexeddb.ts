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

export interface AppSetting<T = unknown> {
  key: string
  value: T
  updatedAt: number
}

class SkillsDatabase extends Dexie {
  skills!: Table<Skill>
  settings!: Table<AppSetting>

  constructor() {
    super('browser-pilot')
    this.version(1).stores({
      skills: 'name, createdAt, updatedAt',
    })
    this.version(2).stores({
      skills: 'name, createdAt, updatedAt',
      settings: 'key, updatedAt',
    })
  }
}

export const db = new SkillsDatabase()
