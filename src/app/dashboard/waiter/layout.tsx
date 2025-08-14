// app/waiter/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { 
  Home, 
  ClipboardList, 
  QrCode, 
  Bell, 
  Settings, 
  LogOut,
  User,
  Clock,
  Wifi,
  Battery,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface WaiterLayoutProps {
  children: ReactNode;
}

const navigationItems = [
  { 
    icon: Home, 
    label: "Dashboard", 
    path: "/dashboard/waiter", 
    activeColor: "var(--sidebar-primary)",
    bgColor: "var(--sidebar-primary)"
  },
  { 
    icon: ClipboardList, 
    label: "Orders", 
    path: "/dashboard/waiter/orders", 
    badge: 5, 
    activeColor: "var(--sidebar-primary)",
    bgColor: "var(--sidebar-primary)"
  },
  { 
    icon: QrCode, 
    label: "QR Codes", 
    path: "/dashboard/waiter/qr", 
    activeColor: "var(--sidebar-primary)",
    bgColor: "var(--sidebar-primary)"
  },
  { 
    icon: Bell, 
    label: "Notifications", 
    path: "/dashboard/waiter/notifications", 
    badge: 3, 
    activeColor: "var(--destructive)",
    bgColor: "var(--destructive)"
  }
];

export default function WaiterLayout({ children }: WaiterLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  interface NavigationItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    badge?: number;
    activeColor: string;
    bgColor: string;
  }

  const NavItem = ({
    item,
    isMobile = false,
  }: {
    item: NavigationItem;
    isMobile?: boolean;
  }) => {
    const isActive = pathname === item.path;
    const Icon = item.icon;

    return (
      <Button
        variant="ghost"
        size="sm"
        className={`flex ${isMobile ? 'w-full justify-start' : 'flex-col'} items-center space-y-1 h-auto py-3 px-4 rounded-xl transition-all duration-200 relative ${
          isActive 
            ? `bg-[var(--sidebar-primary)]/20 text-[var(--sidebar-primary)]` 
            : `text-[var(--sidebar-foreground)]/70 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]`
        } ${isMobile ? 'space-y-0 space-x-3' : ''}`}
        asChild
      >
        <Link href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
          <div className="relative">
            <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
            {item.badge && item.badge > 0 && (
              <Badge 
                className={`absolute ${isMobile ? '-top-1 -right-1' : '-top-2 -right-2'} h-4 w-4 text-xs p-0 flex items-center justify-center bg-[var(--${item.bgColor})] text-[var(--sidebar-primary-foreground)] border-0 shadow-md`}
              >
                {item.badge}
              </Badge>
            )}
          </div>
          <span className={`text-sm font-medium ${
            isActive ? 'font-semibold' : ''
          } ${isMobile ? 'flex-1' : ''}`}>
            {item.label}
          </span>
        </Link>
      </Button>
    );
  };

  return (
    <div className="min-h-screen transition-colors duration-200 bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* Desktop Sidebar - Hidden on mobile, visible on tablet and up */}
      <div className={`fixed left-0 top-0 bottom-0 w-64 z-40 transform transition-transform duration-300 lg:translate-x-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:block hidden md:block bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] shadow-[var(--shadow-lg)]`}>
        
        {/* Sidebar Header */}
        <div className="p-6 border-b border-[var(--sidebar-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-[var(--secondary-foreground)]" />
              </div>
              <div>
                <h2 className="font-bold text-[var(--sidebar-foreground)]">Alex Rivera</h2>
                <p className="text-xs text-[var(--secondary)]">Evening Shift</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-[var(--sidebar-foreground)]"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <div className="p-6 space-y-2">
          {navigationItems.map((item) => (
            <NavItem key={item.path} item={item} isMobile={true} />
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[var(--sidebar-border)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-[var(--sidebar-foreground)]">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="lg:ml-64 md:ml-64">
        {/* Mobile/Tablet Top Header */}
        <div className="md:hidden px-4 py-2 flex items-center justify-between text-xs font-medium bg-[var(--card)] border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="h-8 w-8 p-0 text-[var(--foreground)]"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-1">
              <Wifi className="w-3 h-3 text-[var(--primary)]" />
              <span className="text-[var(--foreground)]">
                WiFi
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[var(--secondary)]" />
              <span className="font-semibold text-[var(--secondary)]">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block px-8 py-6 bg-gradient-to-r from-[var(--sidebar)] to-[var(--sidebar-accent)] border-b border-[var(--sidebar-border)]">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Good Evening</h1>
              <p className="text-sm text-[var(--secondary)] font-medium">Alex Rivera • Evening Shift</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Wifi className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-white">Restaurant WiFi</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Battery className="w-4 h-4 text-[var(--primary)]" />
                  <span className="text-white">85%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[var(--secondary)]" />
                  <span className="font-semibold text-[var(--secondary)]">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
                  <span className="text-xs text-white font-medium">Online</span>
                </div>
                <div className="w-10 h-10 bg-[var(--secondary)] rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--secondary-foreground)]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Alert Banner */}
        <div className="bg-gradient-to-r from-[var(--destructive)] to-[#DC2626] px-4 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="w-4 h-4 text-white animate-pulse" />
              <span className="text-white font-semibold text-sm">
                Kitchen Rush: All orders prioritized
              </span>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 h-6">
              Dismiss
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="pb-20 md:pb-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation - Hidden on tablet and desktop */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-[var(--card)]/95 backdrop-blur-lg border-t border-[var(--border)] shadow-[var(--shadow-lg)] z-30">
        <div className="px-4 py-2">
          <div className="flex items-center justify-around">
            {navigationItems.map((item) => (
              <NavItem key={item.path} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}