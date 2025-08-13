"use client";
// app/layout.tsx or components/layout.tsx
import { ReactNode, useEffect, useState } from "react";
import {
  BarChart3,
  Users,
  Utensils,
  FileText,
  Building2,
  CreditCard,
  TrendingUp,
  MessageSquare,
  Settings,
  LogOut,
  Search,
  Bell,
  Menu,
  X,
  Sun,
  ChefHat,
  ClipboardList as OrderIcon,
  CreditCard as PaymentIcon,
  UserCheck,
  AlertTriangle,
  CheckCircle,
  HandMetal,
  BellRing,
  Trash2
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface LayoutProps {
  children: ReactNode;
}

// Notification types and data
interface Notification {
  id: string;
  type: 'order' | 'payment' | 'staff' | 'waiter_call' | 'checkout' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tableNumber?: string;
  orderId?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #1234 from Table 5 - 2 items',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    priority: 'high',
    tableNumber: 'T005',
    orderId: '#1234'
  },
  {
    id: '2',
    type: 'waiter_call',
    title: 'Waiter Assistance Requested',
    message: 'Table 8 has requested assistance',
    timestamp: new Date(Date.now() - 3 * 60 * 1000),
    read: false,
    priority: 'urgent',
    tableNumber: 'T008'
  },
  {
    id: '3',
    type: 'checkout',
    title: 'Checkout Request',
    message: 'Table 12 is ready to pay - Total: $127.50',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    priority: 'high',
    tableNumber: 'T012'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    message: 'Invoice #INV-2024-003 paid - $254.00',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    read: true,
    priority: 'medium'
  },
  {
    id: '5',
    type: 'staff',
    title: 'Staff Check-in',
    message: 'Maria Rodriguez has checked in for evening shift',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: true,
    priority: 'low'
  },
  {
    id: '6',
    type: 'order',
    title: 'Order Ready',
    message: 'Order #1230 is ready for Table 3',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    read: false,
    priority: 'high',
    tableNumber: 'T003',
    orderId: '#1230'
  },
  {
    id: '7',
    type: 'system',
    title: 'Kitchen Alert',
    message: 'Low stock: Salmon fillet (3 portions remaining)',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    read: true,
    priority: 'medium'
  }
];

const sidebarItems = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard/admin" },
  { icon: Users, label: "Staff", path: "/dashboard/admin/staff" },
  { icon: Utensils, label: "Tables", path: "/dashboard/admin/tables" },
  { icon: ChefHat, label: "Menu", path: "/dashboard/admin/menu" },
  { icon: OrderIcon, label: "Orders", path: "/dashboard/admin/orders", badge: 12 },
  { icon: FileText, label: "Invoices", path: "/dashboard/admin/invoices" },
  { icon: TrendingUp, label: "Reports", path: "/dashboard/admin/reports" },
  { icon: MessageSquare, label: "Messages", path: "/dashboard/admin/messages", badge: 3 },
  { icon: Settings, label: "Settings", path: "/dashboard/admin/settings" },
];

export default function Layout({ children }: LayoutProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string; image?: string } | null>(null);

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
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();
  }, []);

  // Notification functions
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return OrderIcon;
      case 'payment':
        return PaymentIcon;
      case 'staff':
        return UserCheck;
      case 'waiter_call':
        return HandMetal;
      case 'checkout':
        return CreditCard;
      case 'system':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (priority: Notification['priority']) => {
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

  const notifications = mockNotifications;
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentNotifications = notifications.filter(n => n.priority === 'urgent' && !n.read);
  const recentNotifications = notifications.slice(0, 6);

  return (
    <div className="flex h-screen bg-background font-sans">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 bg-sidebar border-r border-sidebar-border flex-col">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">RestaurantOS</h1>
                {/* <p className="text-xs text-sidebar-accent-foreground">Admin Panel</p> */}
              </div>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-sidebar-border">
            {/* <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground">JD</AvatarFallback>
              </Avatar>
              <div> */}

            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage
                  src={user?.image || "/default-logo.png"}
                  alt={user?.name || "User"}
                />
              </Avatar>
              <div>

                {/* <p className="text-sm font-medium text-sidebar-foreground">John Doe</p>
                <p className="text-xs text-sidebar-accent-foreground">Hotel Manager</p> */}

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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className="bg-secondary text-secondary-foreground text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors">
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-card border-b border-border px-4 lg:px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="lg:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getPageTitle()}</h1>
                <p className="text-muted-foreground hidden sm:block">
                  {getPageTitle() === "Dashboard"
                    ? "Welcome back! Here's what's happening in your restaurant."
                    : `Manage your ${getPageTitle().toLowerCase()} efficiently.`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-9 w-64 bg-background border-input text-foreground"
                />
              </div>
              <Button variant="ghost" size="sm">
                <Sun className="w-4 h-4" />
              </Button>
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
                  className="w-96 max-h-[500px] overflow-hidden bg-popover border-border text-popover-foreground"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg text-foreground">Notifications</h3>
                      <div className="flex items-center space-x-2">
                        {unreadCount > 0 && (
                          <Button variant="ghost" size="sm" className="text-xs text-foreground hover:bg-accent">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Mark all read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs text-destructive hover:bg-destructive/10">
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
                          {urgentNotifications.slice(0, 2).map((notification) => (
                            <div key={notification.id} className="text-xs text-destructive">
                              {notification.title} - {notification.tableNumber}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1 max-h-80 overflow-y-auto">
                      {recentNotifications.length > 0 ? (
                        recentNotifications.map((notification) => {
                          const IconComponent = getNotificationIcon(notification.type);
                          return (
                            <div
                              key={notification.id}
                              className={`p-3 hover:bg-accent rounded-md cursor-pointer transition-all duration-200 border-l-2 ${!notification.read
                                ? notification.priority === 'urgent'
                                  ? 'border-destructive bg-destructive/5'
                                  : notification.priority === 'high'
                                    ? 'border-secondary bg-secondary/5'
                                    : 'border-primary bg-primary/5'
                                : 'border-border'
                                }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-1 rounded-full ${notification.priority === 'urgent' ? 'bg-destructive/10' :
                                  notification.priority === 'high' ? 'bg-secondary/10' :
                                    'bg-primary/10'
                                  }`}>
                                  <IconComponent className={`w-3 h-3 ${getNotificationColor(notification.priority)}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${!notification.read ? 'font-semibold text-foreground' : 'text-foreground'
                                      }`}>
                                      {notification.title}
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      {notification.tableNumber && (
                                        <Badge variant="outline" className="text-xs border-border text-foreground">
                                          {notification.tableNumber}
                                        </Badge>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-4 p-0 opacity-0 hover:opacity-100 hover:bg-accent"
                                      >
                                        <X className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <p className={`text-xs mt-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'
                                    }`}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-muted-foreground">
                                      {formatTimeAgo(notification.timestamp)}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-primary rounded-full" />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
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
                  <Button variant="ghost" size="sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" />
                      <AvatarFallback className="bg-muted text-muted-foreground">JD</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover border-border text-popover-foreground"
                >
                  <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="hover:bg-accent hover:text-accent-foreground">
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