import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import ReactDOM from 'react-dom/client'
import Root from '@/components/root'
import { router } from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Root>
    <RouterProvider router={router} />
    <ReactQueryDevtools />
  </Root>,
)
