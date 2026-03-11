import { createHashHistory, createRootRoute, createRoute, createRouter, redirect } from '@tanstack/react-router'
import App from './App'
import AiGateway from './routes/ai-gateway'
import Skills from './routes/skills'

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
const skillsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/skills',
  component: Skills,
})
rootRoute.addChildren([indexRoute, aiGatewayRoute, skillsRoute])

export const router = createRouter({
  routeTree: rootRoute,
  history: createHashHistory(),
})
