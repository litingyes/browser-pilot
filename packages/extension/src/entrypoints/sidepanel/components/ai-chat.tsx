import type { AiModelId } from '@/lib/ai-provider'
import type { AiGateway } from '@/stores/ai-gateways'
import { useChat } from '@ai-sdk/react'
import { DirectChatTransport } from 'ai'
import { InfoIcon } from 'lucide-react'
import { assistant } from '@/agents/assistant'
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorTrigger } from '@/components/ai-elements/model-selector'
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from '@/components/ai-elements/prompt-input'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useAiModels } from '@/hooks/use-ai-models'
import { parseAiModelId } from '@/lib/ai-provider'

interface AiChatProps {
  model: AiModelId
}

export function AiChat({ model }: AiChatProps) {
  const { messages, sendMessage, status, stop, error } = useChat({
    transport: new DirectChatTransport({
      agent: assistant,
      options: {
        model,
      },
      sendReasoning: true,
      sendSources: true,
      sendStart: false,
      sendFinish: false,
    }),
  })
  const isLoading = useMemo(() => status === 'submitted' || status === 'streaming', [status])
  const isLoadingAndNotResponse = useMemo(() => {
    if (!isLoading || !messages.length) {
      return false
    }

    const lastMessage = messages.at(-1)
    if (lastMessage?.role === 'user') {
      return true
    }

    return !lastMessage?.parts?.length
  }, [messages, isLoading])

  const { setAiModel } = useAiModels()
  const { aiModelIds } = useAiGateway()
  const modelGroups = useMemo(() => {
    return aiModelIds.reduce<Record<AiGateway['provider'], string[]>>((groups, aiModelId) => {
      const { providerId, modelName } = parseAiModelId(aiModelId)
      if (!groups[providerId]) {
        groups[providerId] = []
      }
      groups[providerId].push(modelName)

      return groups
    }, {} as Record<AiGateway['provider'], string[]>)
  }, [aiModelIds])
  const selectedModel = useMemo(
    () => model ?? aiModelIds[0],
    [model, aiModelIds],
  )

  return (
    <>
      <Conversation>
        <ConversationContent>
          {messages.map(message => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type === 'text') {
                    return (
                      <MessageResponse key={`${message.id}-${part.type}-${index}`}>
                        {part.text}
                      </MessageResponse>
                    )
                  }
                  else if (part.type === 'reasoning') {
                    return (
                      <Reasoning key={`${message.id}-${part.type}-${index}`}>
                        <ReasoningTrigger />
                        <ReasoningContent>
                          {part.text}
                        </ReasoningContent>
                      </Reasoning>
                    )
                  }

                  return null
                })}
              </MessageContent>
            </Message>
          ))}
          {isLoadingAndNotResponse && (
            <Message from="system">
              <MessageContent>
                <div className="flex items-center gap-2">
                  <Spinner />
                  <Shimmer>
                    Thinking...
                  </Shimmer>
                </div>
              </MessageContent>
            </Message>
          )}
          {error && (
            <Alert variant="destructive">
              <InfoIcon />
              <AlertTitle>
                Error
              </AlertTitle>
              <AlertDescription>
                {error.message}
              </AlertDescription>
            </Alert>
          )}
          {!messages.length && <ConversationEmptyState />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      <PromptInput onSubmit={message => sendMessage(message)}>
        <PromptInputBody>
          <PromptInputTextarea />
        </PromptInputBody>
        <PromptInputFooter>
          <PromptInputTools>
            <ModelSelector>
              <ModelSelectorTrigger
                render={(
                  <Button className="w-fit self-start px-2.5 font-normal" size="sm" type="button" variant="outline" />
                )}
              >
                {selectedModel ?? 'Select model'}
              </ModelSelectorTrigger>
              <ModelSelectorContent className="sm:max-w-2xl">
                <ModelSelectorInput placeholder="Search models..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                  {Object.entries(modelGroups).map(([provider, items]) => (
                    <ModelSelectorGroup key={provider} heading={provider}>
                      {items?.map(model => (
                        <ModelSelectorItem
                          data-checked={selectedModel === model}
                          key={model}
                          value={`${provider} ${model}`}
                          onSelect={() => {
                            setAiModel('sidepanel:chat', `${provider}/${model}`)
                          }}
                        >
                          <ModelSelectorLogo provider={provider === 'openai-compatible' ? 'openai' : provider} />
                          <ModelSelectorName>{model}</ModelSelectorName>
                        </ModelSelectorItem>
                      ))}
                    </ModelSelectorGroup>
                  ))}
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
          </PromptInputTools>
          <PromptInputSubmit onStop={stop} status={status} />
        </PromptInputFooter>
      </PromptInput>
    </>
  )
}
