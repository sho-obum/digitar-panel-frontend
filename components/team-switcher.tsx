"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string
    logo: string | React.ElementType
    logoLight?: string
    logoDark?: string
    plan: string
  }[]
}) {
  const activeTeam = teams[0] // Just use the first team as static display
  const { state } = useSidebar() // Get sidebar state to check if collapsed
  const { theme, resolvedTheme } = useTheme()
  const [logoSrc, setLogoSrc] = React.useState<string>('')

  if (!activeTeam) {
    return null
  }

  // Determine which logo to use based on theme
  const getLogoSrc = (): string => {
    const isDark = resolvedTheme === 'dark'
    if (typeof activeTeam.logo === 'string') {
      return isDark ? activeTeam.logoDark || activeTeam.logo : activeTeam.logoLight || activeTeam.logo
    }
    return '' // fallback for non-string logos
  }

  // Update logo source when theme changes
  React.useEffect(() => {
    setLogoSrc(getLogoSrc())
  }, [resolvedTheme, activeTeam.logo, activeTeam.logoLight, activeTeam.logoDark])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="pointer-events-none">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden">
            {typeof activeTeam.logo === "string" && logoSrc ? (
              <img
                src={logoSrc}
                alt={`${activeTeam.name} logo`}
                className="size-8 object-contain group-data-[collapsible=icon]:size-8"
              />
            ) : typeof activeTeam.logo === "function" ? (
              <activeTeam.logo className="size-5 group-data-[collapsible=icon]:size-6" />
            ) : (
              <div className="flex size-8 items-center justify-center bg-gray-200 text-gray-600 text-sm font-semibold uppercase">
                {activeTeam.name?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
