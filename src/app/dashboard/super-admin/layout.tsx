"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Hotel,
  CreditCard,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarImage
} from "@/components/ui/avatar";
import { signOut } from "@/lib/auth-client";
import { Provider } from "react-redux";
import { store } from "@/store/store";
import { betterFetch } from "@better-fetch/fetch";
import Image from "next/image";

interface LayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard/super-admin" },
  { icon: Hotel, label: "Hotels", path: "/dashboard/super-admin/hotels" },
  // { icon: Users, label: "Users", path: "/dashboard/super-admin/users" },
  { icon: CreditCard, label: "Plans", path: "/dashboard/super-admin/plans" },
  { icon: FileText, label: "Reports", path: "/dashboard/super-admin/reports" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/super-admin/messages", badge: 3 },
  { icon: Settings, label: "Settings", path: "/dashboard/super-admin/settings" },
];

export default function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string; image?: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (pathname === path) {
      
      return true;
    }
    // return pathname.startsWith(path + '/');
  };

  const getPageTitle = () => {
    const currentItem = sidebarItems.find(item => isActivePath(item.path));
    return currentItem?.label || "Dashboard";
  };

  const handleLogout = async () => {
    // Implement logout logic here
    console.log("Logging out...");
    await signOut();
    window.location.href = "/signin";
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
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();

    // Listen for profile photo updates
    const handleProfilePhotoUpdate = () => {
      fetchUserData();
    };

    // Listen for profile data updates (name, email, phone)
    const handleProfileDataUpdate = (event: CustomEvent) => {
      const { name } = event.detail;
      setUser(prev => prev ? { ...prev, name } : null);
    };

    window.addEventListener('profile-photo-updated', handleProfilePhotoUpdate);
    window.addEventListener('profile-updated', handleProfileDataUpdate as EventListener);
    
    return () => {
      window.removeEventListener('profile-photo-updated', handleProfilePhotoUpdate);
      window.removeEventListener('profile-updated', handleProfileDataUpdate as EventListener);
    };
  }, []);


  return (
    <Provider store={store}>
      <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans antialiased">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)]
        transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-[var(--color-sidebar-border)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center h-20">
                  <Image
                    src='/images/Ketrox-web-logo.webp'
                    alt="Ketrox Logo"
                    width={200}
                    height={64}
                    unoptimized={true}
                    priority={true}
                    className="h-full w-auto object-contain"
                  />
                </div>
                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* User */}
            <div className="p-4 border-b border-[var(--color-sidebar-border)]">

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
            <nav className="flex-1 p-4 space-y-1">
              {sidebarItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors ${isActivePath(item.path)
                    ? "bg-[var(--color-sidebar-primary)] text-[var(--color-sidebar-primary-foreground)] border border-[var(--color-sidebar-border)]"
                    : "text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                    }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs rounded-lg bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-accent-foreground)]">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-[var(--color-sidebar-border)]">
              <Button
                variant="ghost"
                className="w-full justify-start space-x-3 text-[var(--color-sidebar-accent-foreground)]"
                onClick={handleLogout}
              >
                <LogOut className="w-5 h-5" />
                <span>Log Out</span>
              </Button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-4 h-4" />
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--color-foreground)]">{getPageTitle()}</h1>
                  <p className="text-sm text-[var(--color-muted-foreground)] hidden sm:block">
                    {getPageTitle() === "Dashboard"
                      ? "Welcome back, Mark! Here's what's happening with your hotels."
                      : `Manage your ${getPageTitle().toLowerCase()} efficiently.`}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-auto p-6 bg-[var(--color-background)] text-[var(--color-foreground)]">
            {children}
          </main>
        </div>
      </div>
    </Provider>
  );

}
