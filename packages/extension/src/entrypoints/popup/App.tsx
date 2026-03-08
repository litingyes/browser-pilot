import { Button } from '@/components/ui/button'

function App() {
  return (
    <>
      <Button onClick={() => browser.runtime.openOptionsPage()}>Options</Button>
    </>
  )
}

export default App
