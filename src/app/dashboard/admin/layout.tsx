"use client";
// app/layout.tsx or components/layout.tsx
import { ReactNode, useCallback, useEffect, useState } from "react";
import {
  Users,
  FileText,
  // CreditCard,
  Settings,
  LogOut,
  // Bell,
  Menu,
  X,
  ClipboardList as OrderIcon,
  CreditCard as PaymentIcon,
  // UserCheck,
  // AlertTriangle,
  // CheckCircle,
  // HandMetal,
  // BellRing,
  // Trash2,
  User,
  Building2,
  LayoutDashboard,
  MessageSquareText,
  ChartNoAxesCombined,
  ShoppingCart,
  Utensils,
  Grid3X3,
  BellRing,
  Bell,
  CheckCircle,
  Trash2,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface LayoutProps {
  readonly children: ReactNode;
}

// Notification types and data
interface Notification {
  id: string;
  type: 'order' | 'status' | 'invoice' | 'chat';
  title: string;
  message?: string;
  read: boolean;
  createdAt: Date;
  // optional, derived from metadata if present
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  tableNumber?: string;
  orderId?: string | null;
  invoiceId?: string | null;
  ticketMessageId?: string | null;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
  { icon: Users, label: "Staff", path: "/dashboard/admin/staff" },
  { icon: Grid3X3, label: "Tables", path: "/dashboard/admin/tables" },
  { icon: Utensils, label: "Menu", path: "/dashboard/admin/menu" },
  { icon: ShoppingCart, label: "Orders", path: "/dashboard/admin/orders" },
  { icon: FileText, label: "Invoices", path: "/dashboard/admin/invoices" },
  { icon: ChartNoAxesCombined, label: "Reports", path: "/dashboard/admin/reports" },
  { icon: MessageSquareText, label: "Messages", path: "/dashboard/admin/messages" },
  { icon: Settings, label: "Settings", path: "/dashboard/admin/settings" },
];
const handleLogout = async () => {
  // Implement logout logic here
  console.log("Logging out...");
  await signOut();
  window.location.href = "/signin";
};

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; tenant_id?: string; name: string; role: string; image?: string } | null>(null);
  const [tenantLogoUrl, setTenantLogoUrl] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [notifWorking, setNotifWorking] = useState(false);

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
          user: { id: string; tenant_id?: string; name: string; role: string; image?: string }
        }>("/api/auth/get-session", {
          baseURL: window.location.origin,
          credentials: "include"
        });

        if (session?.user) {
          setUser({
            id: session.user.id,
            tenant_id: session.user.tenant_id,
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

    // Listen for tenant logo updates
    const handleTenantLogoUpdate = (event: CustomEvent) => {
      const { logoUrl } = event.detail;
      setTenantLogoUrl(logoUrl || null);
    };

    window.addEventListener('tenant-logo-updated', handleTenantLogoUpdate as EventListener);
    return () => {
      window.removeEventListener('tenant-logo-updated', handleTenantLogoUpdate as EventListener);
    };
  }, []);

  // Notification functions
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return OrderIcon;
      case 'invoice':
        return PaymentIcon;
      case 'chat':
        return MessageSquareText;
      case 'status':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (priority?: Notification['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'text-destructive';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-secondary';
      case 'low':
        return 'text-chart-3';
      default:
        return 'text-muted-foreground';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const unreadOrderCount = notifications.filter(n => n.type === 'order' && !n.read).length;
  const unreadChatCount = notifications.filter(n => n.type === 'chat' && !n.read).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read);
  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 10);;

  function getNotificationClasses(notification: Notification): string {
    if (!notification.read) {
      switch (notification.priority) {
        case "urgent":
          return "border-destructive bg-destructive/5";
        case "high":
          return "border-secondary bg-secondary/5";
        default:
          return "border-primary bg-primary/5";
      }
    }
    return "border-border";
  }

  function getNotificationBg(priority?: string): string {
    switch (priority) {
      case "urgent":
        return "bg-destructive/10";
      case "high":
        return "bg-secondary/10";
      default:
        return "bg-primary/10";
    }
  }

  // Load notifications for current user
  type ApiNotification = {
    id: string;
    type: 'order' | 'status' | 'invoice' | 'chat';
    title: string;
    message?: string | null;
    read: boolean;
    createdAt: string;
    orderId?: string | null;
    invoiceId?: string | null;
    ticketMessageId?: string | null;
    metadata?: Record<string, unknown> | null;
  };

  // DB row shape for realtime payloads (snake_case columns)
  type DbNotificationRow = {
    id: string;
    user_id: string;
    tenant_id?: string | null;
    type: 'order' | 'status' | 'invoice' | 'chat';
    title: string;
    message: string | null;
    read: boolean;
    order_id: string | null;
    invoice_id: string | null;
    ticket_message_id: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at?: string;
  };

  const normalizeNotification = useCallback((n: ApiNotification): Notification => {
    const meta = (n?.metadata as { priority?: 'low' | 'medium' | 'high' | 'urgent'; tableNumber?: string; table_number?: string } | null) || {};
    const priority = meta.priority || (n?.type === 'order' ? 'high' : 'medium');
    return {
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message ?? '',
      read: !!n.read,
      createdAt: new Date(n.createdAt),
      priority,
      tableNumber: meta.tableNumber || meta.table_number,
      orderId: n.orderId ?? null,
      invoiceId: n.invoiceId ?? null,
      ticketMessageId: n.ticketMessageId ?? null,
    };
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return;
    setNotifLoading(true);
    try {
      const { data } = await betterFetch<{ notifications: ApiNotification[] }>(`/api/notifications?userId=${user.id}`, {
        baseURL: window.location.origin,
        credentials: "include",
        cache: "no-store",
      });
      const list = (data?.notifications || []).map(normalizeNotification);
      setNotifications(list);
    } catch (e) {
      console.error("Failed to load notifications", e);
    } finally {
      setNotifLoading(false);
    }
  }, [user?.id, normalizeNotification]);

  const handleMarkAllRead = async () => {
    if (!user?.id) return;
    setNotifWorking(true);
    try {
      await betterFetch(`/api/notifications/bulk`, {
        method: 'PATCH',
        body: { userId: user.id, action: 'mark_all_read' },
        baseURL: window.location.origin,
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
      console.error('Failed to mark all as read', e);
    } finally {
      setNotifWorking(false);
    }
  };

  const handleClearAll = async () => {
    if (!user?.id) return;
    setNotifWorking(true);
    try {
      await betterFetch(`/api/notifications/bulk?userId=${user.id}`, {
        method: 'DELETE',
        baseURL: window.location.origin,
        credentials: 'include',
      });
      setNotifications([]);
    } catch (e) {
      console.error('Failed to clear notifications', e);
    } finally {
      setNotifWorking(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    setNotifWorking(true);
    try {
      await betterFetch(`/api/notifications?notificationId=${id}`, {
        method: 'DELETE',
        baseURL: window.location.origin,
        credentials: 'include',
      });
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (e) {
      console.error('Failed to delete notification', e);
    } finally {
      setNotifWorking(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await betterFetch(`/api/notifications`, {
        method: 'PATCH',
        body: { id },
        baseURL: window.location.origin,
        credentials: 'include',
      });
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
    } catch (e) {
      console.error('Failed to mark as read', e);
    }
  };


  useEffect(() => {
    if (!user?.id) return;
    loadNotifications();
  }, [user?.id, loadNotifications]);

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
            title: row.title,
            message: row.message,
            read: row.read,
            createdAt: row.created_at,
            orderId: row.order_id,
            invoiceId: row.invoice_id,
            ticketMessageId: row.ticket_message_id,
            metadata: row.metadata,
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
            title: row.title,
            message: row.message,
            read: row.read,
            createdAt: row.created_at,
            orderId: row.order_id,
            invoiceId: row.invoice_id,
            ticketMessageId: row.ticket_message_id,
            metadata: row.metadata,
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

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
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
                {tenantLogoUrl ? (
                  <Image
                    src={tenantLogoUrl}
                    alt="Hotel Logo"
                    width={200}
                    height={64}
                    unoptimized
                    priority
                    className="h-full w-auto object-contain"
                  />
                ) : (
                  <Building2 className="w-16 h-16 text-muted-foreground" />
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
            {sidebarItems.map((item) => {
              const isActive = isActivePath(item.path);
              const dynamicBadge =
                item.label === "Orders" ? unreadOrderCount :
                item.label === "Messages" ? unreadChatCount : undefined;

              return (
                <Link
                  key={item.path}
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
                  {dynamicBadge !== undefined && dynamicBadge !== null && (
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
            <div className="flex items-center space-x-2 sm:space-x-4">

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    {urgentNotifications.length > 0 ? (
                      <BellRing className="w-4 h-4 text-destructive" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                    {unreadCount > 0 && (
                      <Badge className={`absolute -top-1 -right-1 w-5 h-5 text-xs ${urgentNotifications.length > 0
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-primary text-primary-foreground'
                        }`}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-70 sm:w-96 max-h-[500px] ml-2 sm:ml-0 overflow-hidden bg-popover border-border text-popover-foreground"
                >
                  <div className="p-3">
                    <div className="flex-col flex sm:flex-row items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-foreground">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-foreground hover:bg-accent"
                            onClick={handleMarkAllRead}
                            disabled={notifWorking || unreadCount === 0}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-destructive hover:bg-destructive/10"
                          onClick={handleClearAll}
                          disabled={notifWorking || notifications.length === 0}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Clear all
                        </Button>
                      </div>
                    </div>

                    {urgentNotifications.length > 0 && (
                      <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
                        <h4 className="text-sm font-medium text-destructive mb-1">
                          🚨 Urgent Alerts ({urgentNotifications.length})
                        </h4>
                        <div className="space-y-1">
                          {urgentNotifications.slice(0, 2).map((n) => (
                            <div key={n.id} className="text-xs text-destructive">
                              {n.title}{n.tableNumber ? ` - ${n.tableNumber}` : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 max-h-80 overflow-y-auto scrollbar-hide">
                      {notifLoading ? (
                        <div className="text-center py-6 text-sm text-muted-foreground">
                          Loading...
                        </div>
                      ) : displayedNotifications.length > 0 ? (
                        <>
                          {displayedNotifications.map((notification) => {
                            const IconComponent = getNotificationIcon(notification.type);
                            return (
                              <div
                                key={notification.id}
                                className={`p-3 rounded-md cursor-pointer transition-all duration-200 border-l-2 
     ${!notification.read ? "hover:bg-accent hover:text-accent-foreground" : "bg-muted"} 
    ${getNotificationClasses(notification)}`}
                                onClick={() => !notification.read && handleMarkRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div
                                    className={`p-1 rounded-full ${getNotificationBg(
                                      notification.priority
                                    )}`}
                                  >
                                    <IconComponent
                                      className={`w-3 h-3 ${getNotificationColor(
                                        notification.priority
                                      )}`}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p
                                        className={`text-sm font-medium ${!notification.read
                                          ? "font-semibold text-foreground"
                                          : "text-foreground"
                                          }`}
                                      >
                                        {notification.title}
                                      </p>
                                      <div className="flex items-center space-x-1">
                                        {notification.tableNumber && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs border-border text-foreground"
                                          >
                                            {notification.tableNumber}
                                          </Badge>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-4 w-4 p-0 opacity-0 hover:opacity-100 hover:bg-accent"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteNotification(notification.id);
                                          }}
                                          disabled={notifWorking}
                                        >
                                          <X className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                    <p
                                      className={`text-xs mt-1 ${!notification.read
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                        }`}
                                    >
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-xs text-muted-foreground">
                                        {formatTimeAgo(notification.createdAt)}
                                      </p>
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-primary rounded-full" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}

                          {/* Show More / Show Less toggle */}
                          {notifications.length > 10 && (
                            <div className="text-center py-2">
                              <Button
                                variant="link"
                                className="text-sm text-primary"
                                onClick={() => setShowAll(!showAll)}
                              >
                                {showAll ? "Show less" : "Show more"}
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No notifications</p>
                        </div>
                      )}
                    </div>

                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-transparent hover:text-inherit"
                  >
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
                    <Link href="/dashboard/admin/settings">
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