import { useChat } from '@ai-sdk/react'
import { DirectChatTransport } from 'ai'
import { InfoIcon } from 'lucide-react'
import { useMemo, useRef } from 'react'
import { assistant } from '@/agents/assistant'
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from '@/components/ai-elements/conversation'
import { Message, MessageContent } from '@/components/ai-elements/message'
import { PromptInput, PromptInputBody, PromptInputFooter, PromptInputSubmit, PromptInputTextarea, PromptInputTools } from '@/components/ai-elements/prompt-input'
import { Shimmer } from '@/components/ai-elements/shimmer'
import AiMessage from '@/components/ai-ui/message'
import AiModelSelector from '@/components/ai-ui/model-selector'
import { AiProvider } from '@/components/ai-ui/provider'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { useAiGateway } from '@/hooks/use-ai-gateway'
import { useAiModels } from '@/hooks/use-ai-models'
import { i18n } from '@/i18n'
import { db } from '@/lib/indexeddb'

const NON_DEBUGGABLE_TAB_URL_PREFIXES = [
  'chrome://',
  'edge://',
  'about:',
  'devtools://',
  'chrome-extension://',
  'moz-extension://',
]

function isDebuggableTab(tab: Browser.tabs.Tab | undefined) {
  if (!tab || typeof tab.id !== 'number') {
    return false
  }

  const url = (tab.url ?? '').toLowerCase()
  if (!url) {
    return true
  }

  return !NON_DEBUGGABLE_TAB_URL_PREFIXES.some(prefix => url.startsWith(prefix))
}

async function resolveActiveDebuggableTabId() {
  const candidates = [
    ...(await browser.tabs.query({ active: true, currentWindow: true })),
    ...(await browser.tabs.query({ active: true, lastFocusedWindow: true })),
  ]

  const uniqueCandidates = [...new Map(candidates.map(tab => [tab.id, tab])).values()]
  const targetTab = uniqueCandidates.find(isDebuggableTab)
  if (typeof targetTab?.id === 'number') {
    return targetTab.id
  }

  const fallbackTabs = await browser.tabs.query({ currentWindow: true })
  const fallbackTab = fallbackTabs.find(isDebuggableTab)
  if (typeof fallbackTab?.id === 'number') {
    return fallbackTab.id
  }

  throw new Error('当前浏览器调试器附加失败：未找到可操作的活动标签页。请先打开目标网页并保持其为激活状态后重试，或直接提供 tabId。')
}

export default function Chat() {
  const { modelForSidepanelChat, setAiModel } = useAiModels()
  const { aiModelIds } = useAiGateway()
  const selectedModel = useMemo(
    () => modelForSidepanelChat ?? aiModelIds[0],
    [modelForSidepanelChat, aiModelIds],
  )

  const selectedModelRef = useRef(selectedModel)
  selectedModelRef.current = selectedModel

  const transport = useMemo(() => {
    return new DirectChatTransport({
      agent: assistant,
      options: {
        getModel: () => selectedModelRef.current,
        getSkills: () => db.skills.toArray(),
        getActiveTabId: resolveActiveDebuggableTabId,
      },
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

  return (
    <AiProvider>
      <div className="h-full flex flex-col">
        <Conversation>
          <ConversationContent>
            {messages.map((message, messageIndex) => {
              const isLastMessage = messageIndex === messages.length - 1

              return (
                <AiMessage key={message.id} message={message} isLastMessage={isLastMessage} isLoading={isLoading} regenerate={regenerate} />
              )
            })}
            {isLoadingAndNotResponse && (
              <Message from="system">
                <MessageContent>
                  <div className="flex items-center gap-2">
                    <Spinner />
                    <Shimmer>
                      {i18n.t('chat.thinking')}
                    </Shimmer>
                  </div>
                </MessageContent>
              </Message>
            )}
            {error && (
              <Alert variant="destructive">
                <InfoIcon />
                <AlertTitle>
                  {i18n.t('chat.error')}
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
              <AiModelSelector value={selectedModel} size="sm" onValueChange={id => setAiModel('sidepanel:chat', id)} />
            </PromptInputTools>
            <PromptInputSubmit onStop={stop} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </AiProvider>
  )
}
