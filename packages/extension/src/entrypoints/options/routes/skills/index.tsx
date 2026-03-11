import type { IFsJSON, Skill } from '@/lib/indexeddb'
import { useCallback, useEffect, useRef, useState } from 'react'
import AgentSkills from '@/components/svgs/skills'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { readFolder } from '@/lib/folder-reader'
import { computeHash } from '@/lib/hash'
import { db } from '@/lib/indexeddb'
import { parseSkillMeta } from '@/lib/skill-parser'
import { unzip } from '@/lib/zip'

interface ReadProgress {
  current: number
  total: number
  fileName: string
}

async function processSkillFiles(files: IFsJSON): Promise<Skill | null> {
  const skillMdPath = Object.keys(files).find(path => path.toLowerCase().endsWith('/skill.md'))
  if (!skillMdPath)
    return null

  const skillMd = files[skillMdPath]
  if (!skillMd || skillMd.type !== 'file' || !skillMd.content)
    return null

  const { name, description } = await parseSkillMeta(skillMd.content)
  const computedHash = await computeHash(files)
  const now = Date.now()

  const existing = await db.skills.get(name)
  if (existing) {
    return {
      name,
      description,
      computedHash,
      createdAt: existing.createdAt,
      updatedAt: now,
      files,
    }
  }

  return {
    name,
    description,
    computedHash,
    createdAt: now,
    updatedAt: now,
    files,
  }
}

export default function SkillsRoute() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<ReadProgress | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null)
  const [replaceTarget, setReplaceTarget] = useState<Skill | null>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement | null>(null)

  const loadSkills = useCallback(async () => {
    const allSkills = await db.skills.toArray()
    setSkills(allSkills.sort((a, b) => b.updatedAt - a.updatedAt))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return

    setUploading(true)
    setProgress({ current: 0, total: 1, fileName: file.name })
    try {
      const arrayBuffer = await file.arrayBuffer()
      setProgress({ current: 1, total: 1, fileName: 'Parsing skill...' })
      const files = await unzip(arrayBuffer)
      const skill = await processSkillFiles(files)
      if (!skill)
        return

      const existing = await db.skills.get(skill.name)
      if (existing) {
        setReplaceTarget(skill)
      }
      else {
        await db.skills.add(skill)
        await loadSkills()
      }
    }
    catch (err) {
      console.error('Failed to unzip:', err)
    }
    finally {
      setUploading(false)
      setProgress(null)
      if (zipInputRef.current)
        zipInputRef.current.value = ''
    }
  }

  const handleFolderUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0)
      return

    setUploading(true)
    try {
      const ifsJson = await readFolder(files, p => setProgress(p))
      const skill = await processSkillFiles(ifsJson)
      if (!skill)
        return

      const existing = await db.skills.get(skill.name)
      if (existing) {
        setReplaceTarget(skill)
      }
      else {
        await db.skills.add(skill)
        await loadSkills()
      }
    }
    catch (err) {
      console.error('Failed to read folder:', err)
    }
    finally {
      setUploading(false)
      setProgress(null)
      if (folderInputRef.current)
        folderInputRef.current.value = ''
    }
  }

  const handleReplaceConfirm = async () => {
    if (!replaceTarget)
      return

    await db.skills.put(replaceTarget)
    setReplaceTarget(null)
    await loadSkills()
  }

  const handleDelete = async () => {
    if (!deleteTarget)
      return
    await db.skills.delete(deleteTarget.name)
    setDeleteTarget(null)
    await loadSkills()
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const progressValue = progress ? (progress.current / progress.total) * 100 : 0

  return (
    <div className="px-2 py-4 w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl flex items-center gap-2 text-accent-foreground">
          <AgentSkills className="size-6" />
          Skills
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up available Agent skills.
        </p>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip"
          className="hidden"
          onChange={handleZipUpload}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error - webkitdirectory is a non-standard attribute
          webkitdirectory=""
          className="hidden"
          onChange={handleFolderUpload}
        />
        <Button
          onClick={() => zipInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Upload ZIP'}
        </Button>
        <Button
          variant="outline"
          onClick={() => folderInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Processing...' : 'Upload Folder'}
        </Button>
      </div>

      {progress && (
        <div className="mt-4 space-y-2">
          <Progress value={progressValue} />
          <p className="text-xs text-muted-foreground">
            {progress.fileName}
            {' '}
            (
            {progress.current}
            /
            {progress.total}
            )
          </p>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4">
        {loading
          ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            )
          : skills.length === 0
            ? (
                <p className="text-sm text-muted-foreground">No skills installed.</p>
              )
            : (
                skills.map(skill => (
                  <Card key={skill.name}>
                    <CardHeader>
                      <CardTitle>{skill.name}</CardTitle>
                      {skill.description && (
                        <CardDescription>{skill.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Updated:
                        {' '}
                        {formatDate(skill.updatedAt)}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(skill)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "
              {deleteTarget?.name}
              "? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!replaceTarget} onOpenChange={() => setReplaceTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Replace Skill</AlertDialogTitle>
            <AlertDialogDescription>
              A skill named "
              {replaceTarget?.name}
              " already exists. Do you want to replace it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReplaceConfirm}>Replace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
