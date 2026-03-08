import type { Ref } from 'react'
import type { AiGateway } from '@/hooks/use-ai-gateway'
import { useImperativeHandle, useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface AiGatewayDeleteProps {
  ref: Ref<{
    open: (aiGateway: AiGateway) => void
  }>
  onDeleted?: (aiGateway: AiGateway) => void
}

export default function AiGatewayDelete(
  { ref, onDeleted }: AiGatewayDeleteProps,
) {
  const [isOpen, setIsOpen] = useState(false)
  const [aiGateway, setAiGateway] = useState<AiGateway | null>(null)

  const { removeAiGateway } = useAiGateway()
  const [loading, setLoading] = useState(false)
  const handleDelete = async () => {
    if (!aiGateway)
      return

    setLoading(true)
    await removeAiGateway(aiGateway.provider).then(() => {
      onDeleted?.(aiGateway)
      setIsOpen(false)
    }).catch(() => {
      toast.error('Failed to delete AI Gateway')
    }).finally(() => {
      setLoading(false)
    })
  }

  useImperativeHandle(ref, () => {
    return {
      open: (aiGateway: AiGateway) => {
        setAiGateway(aiGateway)
        setIsOpen(true)
      },
    }
  })

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete AI Gateway
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the AI Gateway:
            <span className="font-bold">
              {' '}
              {aiGateway?.provider}
              {' '}
            </span>
            ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            {loading && <Spinner />}
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
