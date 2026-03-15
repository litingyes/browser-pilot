import type { UIMessage } from 'ai'
import type { ToolPart } from '@/components/ai-elements/tool'
import { CopyIcon, RefreshCcwIcon } from 'lucide-react'
import { Message, MessageAction, MessageActions, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import { Reasoning, ReasoningContent, ReasoningTrigger } from '@/components/ai-elements/reasoning'
import { i18n } from '@/i18n'
import AiMessageTool from './message-tool'

interface AiMessageProps {
  message: UIMessage
  isLastMessage: boolean
  isLoading: boolean
  regenerate: () => void
}

export default function AiMessage({ message, isLastMessage, isLoading, regenerate }: AiMessageProps) {
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
          else if (isToolPart(part)) {
            return (
            // eslint-disable-next-line react/no-array-index-key -- streamed parts have no stable id
              <AiMessageTool key={`${message.id}-${part.type}-${partIndex}`} part={part} />
            )
          }

          return null
        })}
      </MessageContent>
      {message.role === 'assistant' && (!isLastMessage || !isLoading) && (
        <MessageActions>
          <MessageAction tooltip={i18n.t('chat.regenerate')} onClick={() => regenerate()}>
            <RefreshCcwIcon />
          </MessageAction>
          <MessageAction tooltip={i18n.t('chat.copy')} onClick={() => navigator.clipboard.writeText(message.parts.find(part => part.type === 'text')?.text ?? '')}>
            <CopyIcon />
          </MessageAction>
        </MessageActions>
      )}
    </Message>
  )
}

function isToolPart(part: { type: string }): part is ToolPart {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}
