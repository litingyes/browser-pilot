import type { ReactNode } from 'react'
import type { AiGateway } from '@/stores/ai-gateways'
import type { AI_MODELS } from '@/stores/ai-models'
import { storage } from '#imports'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { StrictMode, useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AI_GATEWAY_STORAGE_KEY, aiGatewaysStore } from '@/stores/ai-gateways'
import { AI_MODELS_STORAGE_KEY, aiModelsStore } from '@/stores/ai-models'
import '@/assets/tailwind.css'

const queryClient = new QueryClient()

export default function Root({ children }: { children: ReactNode }) {
  useEffect(() => {
    storage.getItem(AI_GATEWAY_STORAGE_KEY).then((value) => {
      if (value) {
        aiGatewaysStore.setState(() => value as AiGateway[])
      }
      else {
        aiGatewaysStore.setState(() => [] as AiGateway[])
      }
    })
    storage.getItems([AI_GATEWAY_STORAGE_KEY, AI_MODELS_STORAGE_KEY]).then((values) => {
      const aiGateways = values.find(value => value.key === AI_GATEWAY_STORAGE_KEY)?.value as AiGateway[]
      aiGatewaysStore.setState(() => (aiGateways ?? []) as AiGateway[])

      const aiModels = values.find(value => value.key === AI_MODELS_STORAGE_KEY)?.value as AI_MODELS
      aiModelsStore.setState(() => (aiModels ?? {
        'sidepanel:chat': '',
      }) as AI_MODELS)
    })

    const { unsubscribe: unsubscribeAiGateways } = aiGatewaysStore.subscribe((state) => {
      storage.setItem(AI_GATEWAY_STORAGE_KEY, state)
    })
    const { unsubscribe: unsubscribeAiModels } = aiModelsStore.subscribe((state) => {
      storage.setItem(AI_MODELS_STORAGE_KEY, state)
    })

    return () => {
      unsubscribeAiGateways()
      unsubscribeAiModels()
    }
  }, [])

  return (
    <StrictMode>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          {children}
          {import.meta.env.WXT_DEVTOOL_QUERY === 'true' && <ReactQueryDevtools />}
        </QueryClientProvider>
      </TooltipProvider>
      <Toaster />
    </StrictMode>
  )
}
