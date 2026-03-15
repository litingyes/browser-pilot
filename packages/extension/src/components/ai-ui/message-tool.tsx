import type { ReactNode } from 'react'
import type { ToolPart } from '../ai-elements/tool'
import type { ScreenshotResult } from '@/browser-use/screenshot'
import { isObject, isString } from 'es-toolkit/compat'
import { isValidElement } from 'react'
import { CodeBlock } from '@/components/ai-elements/code-block'
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from '@/components/ai-elements/tool'
import {
  ImagePreview,
  ImageRoot,
  ImageZoom,
} from '@/components/assistant-ui/image'

interface AiToolProps {
  part: ToolPart
}

export default function AiMessageTool({ part }: AiToolProps) {
  const isCompleted = part.state === 'output-available' || part.state === 'output-denied' || part.state === 'output-error'

  return (

    <Tool defaultOpen={!isCompleted}>
      {part.type === 'dynamic-tool'
        ? (
            <ToolHeader state={part.state} toolName={part.toolName} type={part.type} />
          )
        : (
            <ToolHeader state={part.state} type={part.type} />
          )}
      <ToolContent>
        <ToolInput input={part.input ?? {}} />
        <ToolOutput
          errorText={part.errorText}
          output={<ToolOutputContent part={part} />}
        />
      </ToolContent>
    </Tool>
  )
}

function ToolOutputContent({ part }: { part: ToolPart }) {
  if (part.type === 'tool-browserUseDispatch' && part.state === 'output-available' && (part.input as { action?: string })?.action === 'TAKE_SCREENSHOT') {
    const output = (part.output as { data: Partial<ScreenshotResult> }).data
    return (
      <ImageRoot
        variant="muted"
        size="lg"
      >
        <ImageZoom src={output?.url ?? ''} alt="Screenshot">
          <ImagePreview src={output?.url ?? ''} alt="Screenshot" />
        </ImageZoom>
      </ImageRoot>
    )
  }

  if (isObject(part.output) && !isValidElement(part.output)) {
    return <CodeBlock code={JSON.stringify(part.output, null, 2)} language="json" />
  }

  if (isString(part.output)) {
    return <CodeBlock code={part.output} language="json" />
  }

  return part.output as ReactNode
}
