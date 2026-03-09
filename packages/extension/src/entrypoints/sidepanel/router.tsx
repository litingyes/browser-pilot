import { createHashHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import App from './App'
import Chat from './routes/chat'

const rootRoute = createRootRoute({
  component: App,
})

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Chat,
})
rootRoute.addChildren([chatRoute])

export const router = createRouter({
  routeTree: rootRoute,
  history: createHashHistory(),
})
