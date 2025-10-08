"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, VariantProps } from "class-variance-authority"
import { PanelLeftIcon } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_ICON = "4.5rem"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = typeof value === "function" ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  const toggleSidebar = React.useCallback(() => {
    setOpen((open) => !open)
  }, [setOpen])

  // Keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  const state = open ? "expanded" : "collapsed"
  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, toggleSidebar }),
    [state, open, setOpen, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        style={{
          "--sidebar-width": SIDEBAR_WIDTH,
          "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
          ...style,
        } as React.CSSProperties}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  collapsible = "icon",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { state } = useSidebar()

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-side={side}
    >
      <div className={cn(
        "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
        "group-data-[collapsible=offcanvas]:w-0",
        "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
      )} />
      <div className={cn(
        "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
        side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0",
        "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r",
        className
      )} {...props}>
        <div className="bg-sidebar flex h-full w-full flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}

// Simplified components
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => { onClick?.(event); toggleSidebar() }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main className={cn("bg-background relative flex w-full flex-1 flex-col", className)} {...props} />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props} />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
}

function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "div"
  return (
    <Comp className={cn(
      "text-sidebar-foreground/70 flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium",
      "group-data-[collapsible=icon]:opacity-0",
      className
    )} {...props} />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("w-full text-sm", className)} {...props} />
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("group/menu-item relative", className)} {...props} />
}

const sidebarMenuButtonVariants = cva(
  "flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-3! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 group-data-[collapsible=icon]:[&>svg]:size-6",
  {
    variants: {
      size: {
        default: "h-8 text-sm",
        lg: "h-12 text-sm group-data-[collapsible=icon]:size-12! group-data-[collapsible=icon]:p-3!",
      },
    },
    defaultVariants: { size: "default" },
  }
)

function SidebarMenuButton({
  asChild = false,
  size = "default",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean
  size?: "default" | "lg"
}) {
  const Comp = asChild ? Slot : "button"
  return <Comp className={cn(sidebarMenuButtonVariants({ size }), className)} {...props} />
}

function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      className={cn("hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] sm:flex", className)}
      {...props}
    />
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
}