"use client";
// app/layout.tsx or components/layout.tsx
import { ReactNode, useEffect, useState } from "react";
import {
  Utensils,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  LayoutDashboard,
  Grid3X3,
  ShoppingCart
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { betterFetch } from "@better-fetch/fetch";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

// Notification types and data


const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/manager" },
  // { icon: Users, label: "Staff", path: "/dashboard/admin/staff" },
  { icon: Grid3X3, label: "Tables", path: "/dashboard/manager/tables" },
  { icon: Utensils, label: "Menu", path: "/dashboard/manager/menu" },
  { icon: ShoppingCart, label: "Orders", path: "/dashboard/manager/orders" },
  { icon: Settings, label: "Settings", path: "/dashboard/manager/settings" },
];

const handleLogout = async () => {
  // Implement logout logic here
  console.log("Logging out...");
  await signOut();
  window.location.href = "/signin";
};

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string; image?: string } | null>(null);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActivePath = (path: string) => {
    return pathname === path;
  };

  const getPageTitle = () => {
    const currentItem = sidebarItems.find(item => isActivePath(item.path));
    return currentItem?.label || "Dashboard";
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await betterFetch<{
          user: { name: string; role: string; image?: string }
        }>("/api/auth/get-session", {
          baseURL: window.location.origin,
          credentials: "include"
        });

        if (session?.user) {
          setUser({
            name: session.user.name,
            role: session.user.role,
            image: session.user.image
          });
        }
        console.log("sfvfvgreerf", session);

      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();

    // Listen for profile photo updates
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener('profile-photo-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-photo-updated', handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const fetchTenantLogo = async () => {
      try {
        const { data } = await betterFetch<{ logoUrl?: string }>("/api/common/tenant-logo", {
          baseURL: window.location.origin,
          credentials: "include"
        });
        if (data?.logoUrl) {
          setTenantLogoUrl(data.logoUrl);
        }
      } catch (error) {
        console.error("Error fetching tenant logo:", error);
      }
    };
    fetchTenantLogo();
    const handleTenantLogoUpdate = (event: CustomEvent) => {
      const { logoUrl } = event.detail;
      if (logoUrl) {
        setTenantLogoUrl(logoUrl);
      }
    };

    window.addEventListener('tenant-logo-updated', handleTenantLogoUpdate as EventListener);
    return () => {
      window.removeEventListener('tenant-logo-updated', handleTenantLogoUpdate as EventListener);
    };
  }, []);


  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex-col
        transform transition-transform duration-300 ease-in-out xl:relative xl:translate-x-0 xl:flex
        ${sidebarOpen ? "translate-x-0 flex" : "-translate-x-full hidden"}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center h-20 flex-1">
                {tenantLogoUrl && (
                  <Image
                    src={tenantLogoUrl}
                    alt="Hotel Logo"
                    width={200}
                    height={64}
                    unoptimized
                    priority
                     fetchPriority="high" 
                    className="h-full w-auto object-contain"
                  />
                )}
              </div>
              <Button variant="ghost" size="sm" className="xl:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={user?.image || "/images/user.png"}
                  alt={user?.name || "User"}
                />
              </Avatar>
              <div>

                <p className="text-sm font-medium text-[var(--color-sidebar-foreground)]">
                  {user?.name || "Loading..."}
                </p>
                <p className="text-xs text-[var(--color-sidebar-accent-foreground)]">
                  {user?.role || ""}
                </p>

              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
            {sidebarItems.map((item, index) => {
              const isActive = isActivePath(item.path);
              return (
                <Link
                  key={index}
                  href={item.path}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-4 xl:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="xl:hidden">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)}>
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">{getPageTitle()}</h1>
                <p className="text-muted-foreground hidden sm:block">
                  {getPageTitle() === "Dashboard"
                    ? "Welcome back! Here's what's happening in your restaurant."
                    : `Manage your ${getPageTitle().toLowerCase()} efficiently.`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
          
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-transparent hover:text-inherit">
                    <Avatar className="h-8 w-8">

                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border text-popover-foreground"
                >
                  <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
                    <Link href="/dashboard/manager/settings">
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground" onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}