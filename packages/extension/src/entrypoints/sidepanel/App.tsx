import { Outlet } from '@tanstack/react-router'

export default function App() {
  return (
    <div className="w-screen h-screen p-2">
      <Outlet />
    </div>
  )
}
