import type { AiGateway } from '@/stores/ai-gateways'
import { useChat } from '@ai-sdk/react'
import { DirectChatTransport } from 'ai'
import { CopyIcon, InfoIcon, RefreshCcwIcon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { assistant } from '@/agents/assistant'
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { ModelSelector, ModelSelectorContent, ModelSelectorEmpty, ModelSelectorGroup, ModelSelectorInput, ModelSelectorItem, ModelSelectorList, ModelSelectorLogo, ModelSelectorName, ModelSelectorTrigger } from '@/components/ai-elements/model-selector'
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from '@/components/ai-elements/prompt-input'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { Shimmer } from '@/components/ai-elements/shimmer'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAiModels } from '@/hooks/use-ai-models'
import { parseAiModelId } from '@/lib/ai-provider'
import { db } from '@/lib/indexeddb'

export default function Chat() {
  const { modelForSidepanelChat, setAiModel } = useAiModels()
  const { aiModelIds } = useAiGateway()
  const selectedModel = useMemo(
    () => modelForSidepanelChat ?? aiModelIds[0],
    [modelForSidepanelChat, aiModelIds],
  )

  const selectedModelRef = useRef(selectedModel)
  selectedModelRef.current = selectedModel

  const selectedModelMetadata = useMemo(() => {
    if (!selectedModel) {
      return null
    }

    return parseAiModelId(selectedModel)
  }, [selectedModel])

  const transport = useMemo(() => {
    return new DirectChatTransport({
      agent: assistant,
      options: {
        getModel: () => selectedModelRef.current,
        getSkills: () => db.skills.toArray(),
      },
      sendReasoning: true,
      sendSources: true,
      sendStart: false,
      sendFinish: false,
    })
  }, [])

  const { messages, sendMessage, status, stop, regenerate, error } = useChat({
    transport,
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

  const modelGroups = useMemo(() => {
    return aiModelIds.reduce<Record<string, {
      models: {
        id: string
        modelName: string
      }[]
      providerForLogo: AiGateway['provider']
    }>>((groups, aiModelId) => {
      const { providerId, providerName, modelName } = parseAiModelId(aiModelId)
      if (!groups[providerName]) {
        groups[providerName] = {
          models: [],
          providerForLogo: providerId,
        }
      }
      groups[providerName].models.push({
        id: aiModelId,
        modelName,
      })

      return groups
    }, {})
  }, [aiModelIds])

  return (
    <div className="h-full flex flex-col">
      <Conversation>
        <ConversationContent>
          {messages.map((message, messageIndex) => {
            const isLastMessage = messageIndex === messages.length - 1

            return (
              <Message key={message.id} from={message.role}>
                <MessageContent>
                  {message.parts.map((part, partIndex) => {
                    const isLastPart = partIndex === message.parts.length - 1

                    if (part.type === 'text') {
                      return (
                        // eslint-disable-next-line react/no-array-index-key -- streamed parts have no stable id
                        <MessageResponse key={`${message.id}-${part.type}-${partIndex}`}>
                          {part.text}
                        </MessageResponse>
                      )
                    }
                    else if (part.type === 'reasoning') {
                      return (
                        // eslint-disable-next-line react/no-array-index-key -- streamed parts have no stable id
                        <Reasoning key={`${message.id}-${part.type}-${partIndex}`} isStreaming={status === 'streaming' && isLastMessage && isLastPart}>
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
                {message.role === 'assistant' && (!isLastMessage || !isLoading) && (
                  <MessageActions>
                    <MessageAction tooltip="Regenerate" onClick={() => regenerate()}>
                      <RefreshCcwIcon />
                    </MessageAction>
                    <MessageAction tooltip="Copy" onClick={() => navigator.clipboard.writeText(message.parts.find(part => part.type === 'text')?.text ?? '')}>
                      <CopyIcon />
                    </MessageAction>
                  </MessageActions>
                )}
              </Message>
            )
          })}
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
              <Tooltip>
                <TooltipTrigger
                  render={(
                    <ModelSelectorTrigger
                      render={(
                        <Button className="w-fit self-start px-2.5 font-normal" size="sm" type="button" variant="outline" />
                      )}
                    >
                      {selectedModelMetadata?.modelName ?? 'Select model'}
                    </ModelSelectorTrigger>
                  )}
                />
                {selectedModelMetadata && (
                  <TooltipContent>
                    {selectedModelMetadata.providerName}
                  </TooltipContent>
                )}
              </Tooltip>
              <ModelSelectorContent className="sm:max-w-2xl">
                <ModelSelectorInput placeholder="Search models..." />
                <ModelSelectorList>
                  <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                  {Object.entries(modelGroups).map(([providerName, group]) => (
                    <ModelSelectorGroup key={providerName} heading={providerName}>
                      {group.models.map(model => (
                        <ModelSelectorItem
                          data-checked={selectedModel === model.id}
                          key={model.id}
                          value={`${providerName} ${model.modelName}`}
                          onSelect={() => {
                            setAiModel('sidepanel:chat', model.id)
                          }}
                        >
                          <ModelSelectorLogo provider={group.providerForLogo === 'openai-compatible' ? 'openai' : group.providerForLogo} />
                          <ModelSelectorName>{model.modelName}</ModelSelectorName>
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
    </div>
  )
}
