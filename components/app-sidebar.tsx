"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  ShoppingCartIcon,
  ClipboardListIcon,
  UtensilsIcon,
  PackageIcon,
  WalletIcon,
  BarChart3Icon,
  Settings2Icon,
  CoffeeIcon,
} from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: <LayoutDashboardIcon />,
  },
  {
    title: "POS Terminal",
    url: "/pos",
    icon: <ShoppingCartIcon />,
  },
  {
    title: "Orders",
    url: "/orders",
    icon: <ClipboardListIcon />,
  },
  {
    title: "Menu",
    url: "/menu",
    icon: <UtensilsIcon />,
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: <PackageIcon />,
  },
  {
    title: "Cash Session",
    url: "/cash-session",
    icon: <WalletIcon />,
  },
  {
    title: "Reports",
    url: "/reports",
    icon: <BarChart3Icon />,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: <Settings2Icon />,
  },
]

type User = {
  name: string
  email: string
  avatar: string
}

export const AppSidebar = ({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & { user: User }) => {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CoffeeIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Coffee Shop POS</span>
                  <span className="truncate text-xs text-muted-foreground">Management System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
