import { createHashHistory, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import App from './App'
import AiGateway from './routes/ai-gateway'

const rootRoute = createRootRoute({
  component: App,
})
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/ai-gateway' })
  },
})
const aiGatewayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ai-gateway',
  component: AiGateway,
})
rootRoute.addChildren([indexRoute, aiGatewayRoute])

export const router = createRouter({
  routeTree: rootRoute,
  history: createHashHistory(),
})
