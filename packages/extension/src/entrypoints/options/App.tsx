import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { BrainCircuitIcon } from 'lucide-react'
import AgentSkills from '@/components/svgs/skills'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'

export default function App() {
  const location = useLocation()

  return (
    <>
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                AI
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link to="/ai-gateway" />} isActive={location.pathname === '/ai-gateway'}>
                      <BrainCircuitIcon />
                      Gateway
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  <SidebarMenuItem>
                    <SidebarMenuButton render={<Link to="/skills" />} isActive={location.pathname === '/skills'}>
                      <AgentSkills />
                      Skills
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      {import.meta.env.WXT_DEVTOOL_ROUTER === 'true' && <TanStackRouterDevtools />}
    </>
  )
}
