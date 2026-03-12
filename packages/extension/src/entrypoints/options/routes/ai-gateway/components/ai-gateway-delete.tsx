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
import { useAiGateway } from '@/hooks/use-ai-gateway'
import { i18n } from '@/i18n'
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
      toast.success(i18n.t('aiGateway.toastDeleted', { name: displayName }))
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
            {i18n.t('aiGateway.deleteTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {i18n.t('aiGateway.deleteConfirm', { name: aiGateway ? getAiGatewayDisplayName(aiGateway) : '' })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {i18n.t('common.cancel')}
          </AlertDialogCancel>
          <Button variant="destructive" onClick={handleDelete}>
            {i18n.t('common.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
