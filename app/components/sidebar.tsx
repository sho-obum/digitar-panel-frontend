"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import {
  BookOpen,
  Bot,
  PieChart,
  Settings2,
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavAdmin } from "@/components/nav-admin";
import { NavPersonalBlock } from "@/components/nav-personal-block";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

/* ------------------------------------------------------------------ */
/* ICON MAP (FOR DYNAMIC SIDEBAR ONLY)                                 */
/* ------------------------------------------------------------------ */
const ICON_MAP: Record<string, any> = {
  dashboard: PieChart,
  campaigns: SquareTerminal,
  templates: BookOpen,
  logs: Bot,
  settings: Settings2,
  users: Users,
};

const getIconFromTitle = (title?: string) => {
  if (!title) return PieChart;
  const key = title.toLowerCase().replace(/\s+/g, "");
  return ICON_MAP[key] ?? PieChart;
};

/* ------------------------------------------------------------------ */
/* STATIC SIDEBAR CONFIG (IMMUTABLE)                                   */
/* ------------------------------------------------------------------ */
const STATIC_SIDEBAR = {
  teams: [
    {
      name: "Digitar Media",
      logo: "https://panel.digitarmedia.com/admin/uploads/d-logo1747116449.png",
      logoLight:
        "https://panel.digitarmedia.com/admin/uploads/d-logo1747116449.png",
      logoDark:
        "https://panel.digitarmedia.com/admin/uploads/digitarWhite1759991560.png",
      plan: "Enterprise Plan",
    },
  ],

  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: PieChart,
    },
    {
      title: "Campaigns",
      url: "#",
      icon: SquareTerminal,
      items: [
        { title: "Create Campaign", url: "/campaign/create-campaign" },
        { title: "Manage Campaigns", url: "/campaign/manage-campaigns" },
      ],
    },
    {
      title: "Templates",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Configure Template", url: "/template/config-template" },
        { title: "Email Templates", url: "/template/email-template" },
        { title: "Manage Categories", url: "/template/manage-categories" },
      ],
    },
    {
      title: "Logs",
      url: "#",
      icon: Bot,
      items: [{ title: "Email Logs", url: "/logs/email-logs" }],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "Email Configuration", url: "/settings/email-configuration" },
      ],
    },
  ],

  adminItems: [
    {
      name: "Management",
      url: "#",
      icon: Users,
      items: [
        { title: "Manage Team", url: "/manage-team" },
        { title: "Manage Roles", url: "/manage-roles" },
      ],
    },
  ],

  personalBlock: [
    {
      name: "Appsflyer Dashboard",
      url: "/digitar-personal-block/appsflyer-dashboard",
      icon: PieChart,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* SIDEBAR COMPONENT                                                   */
/* ------------------------------------------------------------------ */
export default function AppSidebar(
  props: React.ComponentProps<typeof Sidebar>
) {
  const { data: session, status } = useSession();

  const [dynamicItems, setDynamicItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const isMainAdmin = session?.user?.role === "main-admin";
  const isDigiTar =
    session?.user?.team_id === "11fe5f23-d434-11f0-9740-06b6cc65b525";

  React.useEffect(() => {
    if (status !== "authenticated") return;

    if (isMainAdmin) {
      setLoading(false);
      return;
    }

    fetch("/api/navigation")
      .then((res) => res.json())
      .then((data) => {
        const normalized = data.map((item: any) => ({
          ...item,
          icon: getIconFromTitle(item.title),
          items: item.items,
        }));
        setDynamicItems(normalized);
      })
      .finally(() => setLoading(false));
  }, [status, isMainAdmin]);

  /* -------------------------------------------------------------- */
  /* Avoid flicker                                                  */
  /* -------------------------------------------------------------- */
  if (status === "loading" || loading) {
    return null;
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={STATIC_SIDEBAR.teams} />
      </SidebarHeader>

      <SidebarContent>
        {isMainAdmin ? (
          <>
            <NavMain items={STATIC_SIDEBAR.navMain} />
            <NavAdmin items={STATIC_SIDEBAR.adminItems} />

            {/* Personal block only for DigiTar main-admin */}
            {isDigiTar && STATIC_SIDEBAR.personalBlock.length > 0 && (
              <NavPersonalBlock items={STATIC_SIDEBAR.personalBlock} />
            )}
          </>
        ) : (
          <>
            <NavMain items={dynamicItems} />

            {/* Personal block only for DigiTar non-admin */}
            {isDigiTar && STATIC_SIDEBAR.personalBlock.length > 0 && (
              <NavPersonalBlock items={STATIC_SIDEBAR.personalBlock} />
            )}
          </>
        )}
      </SidebarContent>

      <SidebarFooter />
      <SidebarRail />
    </Sidebar>
  );
}
