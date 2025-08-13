"use client"

import { usePathname } from "next/navigation"
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils" // If you have a `cn` utility for className merging

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string // now expects "dashboard", "hotels", etc.
    icon?: React.ElementType
  }[]
}) {
  const pathname = usePathname()
  const routeAfterSuperAdmin = pathname.split("/super-admin/")[1]?.split("/")[0] || ""

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = routeAfterSuperAdmin === (item.title).toLowerCase()

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    isActive
                      ? "bg-muted text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                  asChild
                >
                  <a href={`/dashboard/super-admin/${item.url}`} className="flex items-center gap-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
