import type { IFsJSON } from './indexeddb'

interface ReadProgress {
  current: number
  total: number
  fileName: string
}

type ProgressCallback = (progress: ReadProgress) => void

function getParentPaths(path: string): string[] {
  const parts = path.split('/').filter(Boolean)
  const parents: string[] = []
  for (let i = 1; i < parts.length; i++) {
    parents.push(parts.slice(0, i).join('/'))
  }
  return parents
}

export async function readFolder(
  files: FileList,
  onProgress?: ProgressCallback,
): Promise<IFsJSON> {
  const result: IFsJSON = {}
  const fileArray = [...files]

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i]

    onProgress?.({
      current: i + 1,
      total: fileArray.length,
      fileName: file.name,
    })

    let filePath: string

    if ((file as File & { webkitRelativePath?: string }).webkitRelativePath) {
      filePath = (file as File & { webkitRelativePath: string }).webkitRelativePath
    }
    else {
      filePath = file.name
    }

    for (const parent of getParentPaths(filePath)) {
      if (!result[parent]) {
        result[parent] = { type: 'dir' }
      }
    }

    const content = await file.text()
    result[filePath] = { type: 'file', content }
  }

  return result
}
