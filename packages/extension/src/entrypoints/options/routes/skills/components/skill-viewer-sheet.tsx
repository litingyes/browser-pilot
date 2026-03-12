import type { FileTreeItem as FileTreeItemType } from '../lib/file-tree'
import type { Skill } from '@/lib/indexeddb'
import { ChevronRightIcon, DownloadIcon, FileIcon, FolderIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CodeBlockContent } from '@/components/ai-elements/code-block'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { i18n } from '@/i18n'
import { buildFileTree, getLanguageFromExt, isTextFile } from '../lib/file-tree'

interface SkillViewerSheetProps {
  skill: Skill | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function FileTreeItem({
  item,
  onSelectFile,
  selectedPath,
  depth = 0,
}: {
  item: FileTreeItemType
  onSelectFile: (path: string) => void
  selectedPath: string | null
  depth?: number
}) {
  if ('items' in item) {
    return (
      <Collapsible key={item.name} defaultOpen={depth === 0}>
        <CollapsibleTrigger
          render={(
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start transition-none hover:bg-accent hover:text-accent-foreground"
            >
              <ChevronRightIcon className="size-4 shrink-0 transition-transform in-data-panel-open:rotate-90" />
              <FolderIcon className="size-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </Button>
          )}
        />
        <CollapsibleContent className="mt-1 ml-5">
          <div className="flex flex-col gap-1">
            {item.items.map(child => (
              <FileTreeItem
                key={'path' in child ? child.path : child.name}
                item={child}
                onSelectFile={onSelectFile}
                selectedPath={selectedPath}
                depth={depth + 1}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const isSelected = selectedPath === item.path
  return (
    <Button
      key={item.path}
      variant="link"
      size="sm"
      className={`w-full justify-start gap-2 text-foreground ${isSelected ? 'bg-accent' : ''}`}
      onClick={() => onSelectFile(item.path)}
    >
      <FileIcon className="size-4 shrink-0" />
      <span className="truncate">{item.name}</span>
    </Button>
  )
}

export function SkillViewerSheet({ skill, open, onOpenChange }: SkillViewerSheetProps) {
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  const fileTree = useMemo(() => {
    if (!skill)
      return []
    return buildFileTree(skill.files)
  }, [skill])

  const filePaths = useMemo(() => {
    if (!skill)
      return []
    return Object.keys(skill.files).filter(
      path => skill.files[path].type === 'file' && typeof skill.files[path].content === 'string',
    )
  }, [skill])

  useEffect(() => {
    if (open && skill && filePaths.length > 0) {
      setSelectedPath(prev => (prev && filePaths.includes(prev) ? prev : filePaths[0]))
    }
  }, [open, skill, filePaths])

  const selectedEntry = skill && selectedPath ? skill.files[selectedPath] : null
  const selectedContent = selectedEntry?.type === 'file' ? selectedEntry.content : undefined
  const selectedLanguage = selectedPath ? getLanguageFromExt(selectedPath) : null
  const canPreview = selectedPath && isTextFile(selectedPath)

  const handleOpenChange = useCallback((next: boolean) => {
    if (!next)
      setSelectedPath(null)
    onOpenChange(next)
  }, [onOpenChange])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full max-w-7xl! flex-col"
      >
        <SheetHeader>
          <SheetTitle>{skill?.name ?? i18n.t('skillViewer.title')}</SheetTitle>
        </SheetHeader>

        <ResizablePanelGroup orientation="horizontal">
          <ResizablePanel defaultSize={240}>
            <ScrollArea>
              <div className="px-3">
                {fileTree.map(item => (
                  <FileTreeItem
                    key={'path' in item ? item.path : item.name}
                    item={item}
                    onSelectFile={setSelectedPath}
                    selectedPath={selectedPath}
                  />
                ))}
              </div>
            </ScrollArea>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ScrollArea>
              <div className="flex flex-col px-3">
                {selectedPath
                  ? (
                      <>
                        <div className="flex shrink-0 items-center justify-between gap-2 py-2">
                          <span className="truncate font-mono text-sm">{selectedPath}</span>
                          <div className="flex shrink-0 items-center gap-2">
                            {selectedContent !== undefined && (
                              <>
                                <span className="text-xs text-muted-foreground">
                                  {formatFileSize(new Blob([selectedContent]).size)}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => downloadFile(selectedPath.split('/').pop() ?? selectedPath, selectedContent)}
                                >
                                  <DownloadIcon className="size-4" />
                                  <span className="sr-only">{i18n.t('skillViewer.download')}</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="min-h-0 flex-1 overflow-auto">
                          {canPreview && selectedContent !== undefined && selectedLanguage
                            ? (
                                <div className="rounded-md border">
                                  <CodeBlockContent
                                    code={selectedContent}
                                    language={selectedLanguage}
                                    showLineNumbers
                                  />
                                </div>
                              )
                            : selectedPath
                              ? (
                                  <p className="py-4 text-sm text-muted-foreground">
                                    {i18n.t('skillViewer.previewUnsupported')}
                                  </p>
                                )
                              : null}
                        </div>
                      </>
                    )
                  : (
                      <p className="py-4 text-sm text-muted-foreground">
                        {i18n.t('skillViewer.selectFileToView')}
                      </p>
                    )}
              </div>
            </ScrollArea>
          </ResizablePanel>
        </ResizablePanelGroup>
      </SheetContent>
    </Sheet>
  )
}
