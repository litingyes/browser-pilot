import { RouterProvider } from '@tanstack/react-router'
import * as React from 'react'
import ReactDOM from 'react-dom/client'
import { router } from './router'
import '@/assets/tailwind.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
