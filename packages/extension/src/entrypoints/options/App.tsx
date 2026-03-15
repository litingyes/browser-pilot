import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useStore } from '@tanstack/react-store'
import { BrainCircuitIcon, FolderCodeIcon } from 'lucide-react'
import AgentSkills from '@/components/svgs/skills'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from '@/components/ui/sidebar'
import { i18n } from '@/i18n'
import { localeStore } from '@/stores/locale'

export default function App() {
  const location = useLocation()
  useStore(localeStore, state => state)

  return (
    <>
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarContent>
            <SidebarGroup>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={location.pathname === '/preferences'} asChild>
                  <Link to="/preferences">
                    <FolderCodeIcon />
                    {i18n.t('sidebar.preferences')}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>
                {i18n.t('sidebar.ai')}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={location.pathname === '/ai-gateway'} asChild>
                      <Link to="/ai-gateway">
                        <BrainCircuitIcon />
                        {i18n.t('sidebar.gateway')}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive={location.pathname === '/skills'} asChild>
                      <Link to="/skills">
                        <AgentSkills />
                        {i18n.t('sidebar.skills')}
                      </Link>
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
