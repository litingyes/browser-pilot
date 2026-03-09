import { Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export default function App() {
  return (
    <>
      <div className="w-screen h-screen p-2">
        <Outlet />
      </div>
      {import.meta.env.WXT_DEVTOOL_ROUTER === 'true' && <TanStackRouterDevtools />}
    </>
  )
}
