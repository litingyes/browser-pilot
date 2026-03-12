import type { AiGateway } from '@/stores/ai-gateways'
import { BrainCircuitIcon, PenIcon, TrashIcon } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { useAiGateway } from '@/hooks/use-ai-gateway'
import { AI_GATEWAY_METADATA } from '@/lib/ai-gateway'
import { getAiGatewayDisplayName, getAiGatewayId } from '@/stores/ai-gateways'
import AiGatewayDelete from './components/ai-gateway-delete'
import AiGatewayForm from './components/ai-gateway-form'

export default function AiGatewayRoute() {
  const { aiGateways } = useAiGateway()
  const [editMode, setEditMode] = useState<string | 'add' | null>(null)

  const deleteRef = useRef<{
    open: (aiGateway: AiGateway) => void
  }>(null)

  return (
    <div className="px-2 py-4 w-full max-w-xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl flex items-center gap-2 text-accent-foreground">
          <BrainCircuitIcon className="size-6" />
          AI Gateway
        </h1>
        <p className="text-sm text-muted-foreground">
          Set up available AI models.
        </p>
      </div>
      <div role="list" className="mt-6 flex flex-col gap-4">
        {aiGateways.map((aiGateway) => {
          const aiGatewayId = getAiGatewayId(aiGateway)
          const displayName = getAiGatewayDisplayName(aiGateway)

          return (
            <Fragment key={aiGatewayId}>
              {editMode === aiGatewayId
                ? (<AiGatewayForm defaultValue={aiGateway} onUpdated={() => setEditMode(null)} />)
                : (
                    <Item variant="outline">
                      <ItemMedia variant="icon">
                        {AI_GATEWAY_METADATA[aiGateway.provider].icon}
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle>{displayName}</ItemTitle>
                        <ItemDescription className="flex flex-wrap items-center gap-2">
                          {aiGateway.models.map(model => <Badge key={model} variant="secondary">{model}</Badge>)}
                        </ItemDescription>
                      </ItemContent>
                      <ItemActions>
                        <Button variant="ghost" size="icon" onClick={() => setEditMode(aiGatewayId)}>
                          <PenIcon />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => deleteRef.current?.open(aiGateway)}>
                          <TrashIcon />
                        </Button>
                      </ItemActions>
                    </Item>
                  )}
            </Fragment>
          )
        })}
        {!editMode && <Button variant="outline" onClick={() => setEditMode('add')}>Add AI Gateway</Button>}
        {(editMode === 'add' || !aiGateways.length) && <AiGatewayForm onUpdated={() => setEditMode(null)} />}
      </div>
      <AiGatewayDelete ref={deleteRef} onDeleted={() => setEditMode(null)} />
    </div>
  )
}
