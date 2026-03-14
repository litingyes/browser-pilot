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

export interface ScreenshotRecord {
  id: string
  tabId: number
  createdAt: number
  mimeType: string
  bytes: number
  width?: number
  height?: number
  path: string
  blob: Blob
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
  screenshots!: Table<ScreenshotRecord>

  constructor() {
    super('browser-pilot')
    this.version(1).stores({
      skills: 'id, name',
    })
    this.version(2).stores({
      skills: 'id, name',
      screenshots: 'id, tabId, createdAt',
    })
  }
}

export const db = new SkillsDatabase()
