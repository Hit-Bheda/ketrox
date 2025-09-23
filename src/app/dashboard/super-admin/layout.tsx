"use client";

import { ReactNode, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Settings,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  MessageSquareText,
  ChartNoAxesCombined,
  Crown,
  Building
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
import { supabase } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface LayoutProps {
  children: ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/super-admin" },
  { icon: Building, label: "Hotels", path: "/dashboard/super-admin/hotels" },
  // { icon: Users, label: "Users", path: "/dashboard/super-admin/users" },
  { icon: Crown, label: "Plans", path: "/dashboard/super-admin/plans" },
  { icon: ChartNoAxesCombined, label: "Reports", path: "/dashboard/super-admin/reports" },
  { icon: MessageSquareText, label: "Messages", path: "/dashboard/super-admin/messages" },
  { icon: Settings, label: "Settings", path: "/dashboard/super-admin/settings" },
];

// Minimal notification typings for sidebar badge computation
type NotificationType = 'order' | 'status' | 'invoice' | 'chat';
interface Notification {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
}
type ApiNotification = {
  id: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
};
type DbNotificationRow = {
  id: string;
  user_id: string;
  type: NotificationType;
  read: boolean;
  created_at: string;
};

export default function DashboardLayout({ children }: LayoutProps) {
  const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string } | null>(null);


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
          user: { id: string; name: string; role: string; image?: string }
        }>("/api/auth/get-session", {
          baseURL: window.location.origin,
          credentials: "include"
        });

        if (session?.user) {
          setUser({
            id: session.user.id,
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

  // Normalize API notification -> UI shape
  const normalizeNotification = useCallback((n: ApiNotification): Notification => ({
    id: n.id,
    type: n.type,
    read: !!n.read,
    createdAt: new Date(n.createdAt),
  }), []);

  // Load notifications for super-admin user
  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data } = await betterFetch<{ notifications: ApiNotification[] }>(`/api/notifications?userId=${user.id}`, {
        baseURL: window.location.origin,
        credentials: "include",
        cache: "no-store",
      });
      const list = (data?.notifications || []).map(normalizeNotification);
      setNotifications(list);
    } catch (e) {
      console.error("Failed to load notifications (super-admin)", e);
    }
  }, [user?.id, normalizeNotification]);

  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
  }, [user?.id, loadNotifications]);

  // Realtime subscription to notifications for this user
  useEffect(() => {
    if (!user?.id) return;
    const client = supabase();
    const channel = client
      .channel(`realtime:notification:user:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notification', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<DbNotificationRow>) => {
          const row = payload.new as DbNotificationRow;
          if (!row) return;
          const apiNotification: ApiNotification = {
            id: row.id,
            type: row.type,
            read: row.read,
            createdAt: row.created_at,
          };
          setNotifications(prev => {
            if (prev.some(n => n.id === apiNotification.id)) return prev;
            return [normalizeNotification(apiNotification), ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notification', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<DbNotificationRow>) => {
          const row = payload.new as DbNotificationRow;
          if (!row) return;
          const apiNotification: ApiNotification = {
            id: row.id,
            type: row.type,
            read: row.read,
            createdAt: row.created_at,
          };
          setNotifications(prev => prev.map(n => n.id === apiNotification.id ? normalizeNotification(apiNotification) : n));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'notification', filter: `user_id=eq.${user.id}` },
        (payload: RealtimePostgresChangesPayload<DbNotificationRow>) => {
          const row = payload.old as DbNotificationRow;
          if (!row) return;
          setNotifications(prev => prev.filter(n => n.id !== row.id));
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id, normalizeNotification]);

    const markAllChatRead = useCallback(async () => {
    if (!user?.id) return;
    try {
      await betterFetch(`/api/notifications/bulk`, {
        method: 'PATCH',
        body: { userId: user.id, action: 'mark_all_read' },
        baseURL: window.location.origin,
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => n.type === 'chat' ? { ...n, read: true } : n));
    } catch (e) {
      console.error("Failed to mark all chat notifications as read", e);
    }
  }, [user?.id]);

  // Mark as read when visiting /messages
  useEffect(() => {
    if (pathname === '/dashboard/super-admin/messages') {
      markAllChatRead();
    }
  }, [pathname, markAllChatRead]);

  const unreadChatCount = notifications.filter(n => n.type === 'chat' && !n.read).length;


  return (
    <Provider store={store}>
      <div className="flex h-screen bg-[var(--color-background)] text-[var(--color-foreground)] font-sans antialiased">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--color-sidebar)] border-r border-[var(--color-sidebar-border)]
        transform transition-transform duration-300 ease-in-out xl:relative xl:translate-x-0
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
                     fetchPriority="high" 
                    className="h-full w-auto object-contain"
                  />
                </div>
                <Button variant="ghost" size="sm" className="xl:hidden pb-20" onClick={() => setSidebarOpen(false)}>
                  <X className="w-5 h-5 bg-[#f59f0a] rounded-full p-[2px]" />
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
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
              {sidebarItems.map((item, index) => {
                const dynamicBadge = item.label === "Messages" ? unreadChatCount : undefined;
                const handleClick = () => {
                  setSidebarOpen(false);
                  if (item.label === "Messages") {
                    markAllChatRead();
                  }
                };
                return (
                  <Link
                    key={index}
                    href={item.path}
                    className={`flex items-center justify-between px-3 py-2 text-sm rounded-xl transition-colors ${isActivePath(item.path)
                      ? "bg-[var(--color-sidebar-primary)] text-[var(--color-sidebar-primary-foreground)] border border-[var(--color-sidebar-border)]"
                      : "text-[var(--color-sidebar-accent-foreground)] hover:bg-[var(--color-sidebar-accent)]"
                      }`}
                    onClick={handleClick}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    {typeof dynamicBadge === 'number' && (
                      <Badge
                        variant="secondary"
                        className={`text-xs ${dynamicBadge > 0
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-secondary text-secondary-foreground"
                          }`}
                      >
                        {dynamicBadge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
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
          <header className="bg-[var(--color-background)] border-b border-[var(--color-border)] px-4 xl:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="xl:hidden"
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
