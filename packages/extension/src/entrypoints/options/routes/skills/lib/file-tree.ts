import type { BundledLanguage } from 'shiki'
import type { IFsJSON } from '@/lib/indexeddb'

export type FileTreeItem
  = | { name: string, path: string }
    | { name: string, items: FileTreeItem[] }

const TEXT_EXTENSIONS: Record<string, BundledLanguage> = {
  '.md': 'markdown',
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.json': 'json',
  '.txt': 'markdown',
  '.css': 'css',
  '.html': 'html',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.sh': 'shell',
  '.bash': 'shell',
  '.py': 'python',
}

export function getLanguageFromExt(path: string): BundledLanguage | null {
  const dotIdx = path.lastIndexOf('.')
  if (dotIdx < 0)
    return null
  const ext = path.slice(dotIdx)
  return TEXT_EXTENSIONS[ext.toLowerCase()] ?? null
}

export function isTextFile(path: string): boolean {
  return getLanguageFromExt(path) !== null
}

function ensurePath(
  tree: Map<string, FileTreeItem>,
  pathParts: string[],
  fullPath: string,
) {
  if (pathParts.length === 1) {
    const name = pathParts[0]
    if (!tree.has(name)) {
      tree.set(name, { name, path: fullPath })
    }
    return
  }

  const [dirName, ...rest] = pathParts
  let dirNode = tree.get(dirName)

  if (!dirNode) {
    dirNode = { name: dirName, items: [] }
    tree.set(dirName, dirNode)
  }

  if ('items' in dirNode) {
    const childMap = new Map<string, FileTreeItem>()
    for (const item of dirNode.items) {
      childMap.set(item.name, item)
    }
    ensurePath(childMap, rest, fullPath)
    dirNode.items = [...childMap.values()].toSorted((a, b) => {
      const aIsDir = 'items' in a
      const bIsDir = 'items' in b
      if (aIsDir !== bIsDir)
        return aIsDir ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }
}

export function buildFileTree(files: IFsJSON): FileTreeItem[] {
  const root = new Map<string, FileTreeItem>()

  for (const path of Object.keys(files)) {
    const entry = files[path]
    if (entry.type !== 'file' || typeof entry.content !== 'string')
      continue

    const parts = path.split('/').filter(Boolean)
    if (parts.length === 0)
      continue

    ensurePath(root, parts, path)
  }

  return [...root.values()].toSorted((a, b) => {
    const aIsDir = 'items' in a
    const bIsDir = 'items' in b
    if (aIsDir !== bIsDir)
      return aIsDir ? -1 : 1
    return a.name.localeCompare(b.name)
  })
}
