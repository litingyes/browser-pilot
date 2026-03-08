import { useAiModels } from '@/hooks/use-ai-models'
import { AiChat } from './components/ai-chat'

export default function App() {
  const { modelForSidepanelChat } = useAiModels()

  return (
    <div className="w-screen h-screen flex flex-col p-2">
      <AiChat key={modelForSidepanelChat} model={modelForSidepanelChat} />
    </div>
  )
}
