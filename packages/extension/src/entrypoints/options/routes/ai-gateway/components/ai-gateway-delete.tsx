import type { Ref } from 'react'
import type { AiGateway } from '@/stores/ai-gateways'
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
import { getAiGatewayDisplayName } from '@/stores/ai-gateways'

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
  const handleDelete = async () => {
    if (!aiGateway)
      return

    const displayName = getAiGatewayDisplayName(aiGateway)
    const isSuccess = removeAiGateway(aiGateway)
    if (isSuccess) {
      onDeleted?.(aiGateway)
      toast.success(`AI Gateway ${displayName} deleted`)
      setIsOpen(false)
    }
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
              {aiGateway ? getAiGatewayDisplayName(aiGateway) : ''}
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
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
