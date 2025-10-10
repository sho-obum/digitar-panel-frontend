"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "Username",
    email: "user@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Digitar Media",
      logo: "https://panel.digitarmedia.com/admin/uploads/d-logo1747116449.png",
      logoLight: "https://panel.digitarmedia.com/admin/uploads/d-logo1747116449.png",
      logoDark: "https://panel.digitarmedia.com/admin/uploads/digitarWhite1759991560.png",
      plan: "Enterprise Plan",
    },
  ],
  navMain: [
    {
      title: "Heading 1",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Sub Item 1",
          url: "#",
        },
        {
          title: "Sub Item 2",
          url: "#",
        },
        {
          title: "Sub Item 3",
          url: "#",
        },
      ],
    },
    {
      title: "Heading 2",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Sub Item 1",
          url: "#",
        },
        {
          title: "Sub Item 2" ,
          url: "#",
        },
        {
          title: "Sub Item 3",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export default function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        {/* Profile moved to header - footer now empty */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
