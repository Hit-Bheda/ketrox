// app/waiter/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Coffee,
  Utensils,
  Timer,
  DollarSign,
  Bell,
  Eye,
  ChefHat,
  Star,
  ClipboardList,
  TrendingUp,
  Award,
  Target,
  Zap
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useTheme } from "next-themes";

// Enhanced dummy data with more realistic information
const assignedTables = [
  {
    id: 'T-03',
    number: '03',
    name: 'Window Booth',
    capacity: 4,
    status: 'ordering',
    currentGuests: 3,
    orderCount: 1,
    orderId: 'ORD-1235',
    orderTime: '2:15 PM',
    estimatedTime: '15 min',
    totalAmount: 0,
    priority: 'normal',
    customerNotes: 'Birthday celebration - dessert surprise',
    lastActivity: '3 min ago',
    orderItems: ['Margherita Pizza', 'Caesar Salad', 'Garlic Bread']
  },
  {
    id: 'T-07',
    number: '07',
    name: 'Corner Table',
    capacity: 2,
    status: 'preparing',
    currentGuests: 2,
    orderCount: 1,
    orderId: 'ORD-1238',
    orderTime: '1:45 PM',
    estimatedTime: '8 min',
    totalAmount: 89.50,
    priority: 'high',
    customerNotes: 'No dairy products, extra spicy',
    lastActivity: '1 min ago',
    orderItems: ['Vegan Pasta', 'Spicy Wings', 'Coconut Water']
  },
  {
    id: 'T-12',
    number: '12',
    name: 'Patio Premium',
    capacity: 6,
    status: 'served',
    currentGuests: 5,
    orderCount: 1,
    orderId: 'ORD-1240',
    orderTime: '1:30 PM',
    estimatedTime: 'Ready to pay',
    totalAmount: 234.75,
    priority: 'urgent',
    customerNotes: 'Business dinner - VIP service required',
    lastActivity: 'Just now',
    orderItems: ['Ribeye Steak', 'Lobster Tail', 'Wine Selection', 'Chocolate Cake']
  },
  {
    id: 'T-15',
    number: '15',
    name: 'Garden View',
    capacity: 4,
    status: 'idle',
    currentGuests: 0,
    orderCount: 0,
    orderId: null,
    orderTime: null,
    estimatedTime: null,
    totalAmount: 0,
    priority: 'normal',
    customerNotes: null,
    lastActivity: '25 min ago',
    orderItems: []
  },
  {
    id: 'T-18',
    number: '18',
    name: 'Bar Counter',
    capacity: 3,
    status: 'preparing',
    currentGuests: 2,
    orderCount: 1,
    orderId: 'ORD-1242',
    orderTime: '2:30 PM',
    estimatedTime: '12 min',
    totalAmount: 67.25,
    priority: 'normal',
    customerNotes: 'Extra spicy, no ice in drinks',
    lastActivity: '5 min ago',
    orderItems: ['Buffalo Wings', 'Craft Beer', 'Onion Rings']
  },
  {
    id: 'T-21',
    number: '21',
    name: 'VIP Booth',
    capacity: 8,
    status: 'ordering',
    currentGuests: 6,
    orderCount: 0,
    orderId: null,
    orderTime: null,
    estimatedTime: null,
    totalAmount: 0,
    priority: 'high',
    customerNotes: 'Anniversary dinner - VIP service, quiet atmosphere',
    lastActivity: '2 min ago',
    orderItems: []
  }
];

export default function WaiterDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftStats, setShiftStats] = useState({
    tablesServed: 12,
    ordersCompleted: 18,
    totalEarnings: 145.50,
    customerRating: 4.8,
    averageServiceTime: '16 min',
    efficiency: 87
  });
  const { theme } = useTheme();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-[var(--muted)]';
      case 'ordering': return 'bg-[var(--secondary)]';
      case 'preparing': return 'bg-[var(--primary)]';
      case 'served': return 'bg-[var(--sidebar)]';
      default: return 'bg-[var(--muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return <Coffee className="w-5 h-5" />;
      case 'ordering': return <Clock className="w-5 h-5" />;
      case 'preparing': return <ChefHat className="w-5 h-5" />;
      case 'served': return <CheckCircle className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'idle': return 'Available';
      case 'ordering': return 'Taking Order';
      case 'preparing': return 'Kitchen Prep';
      case 'served': return 'Ready to Pay';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-[var(--destructive)] bg-[var(--card)] shadow-lg';
      case 'high': return 'border-l-4 border-[var(--secondary)] bg-[var(--card)] shadow-md';
      case 'normal': return 'border-l-4 border-[var(--primary)] bg-[var(--card)] shadow-sm';
      default: return 'border-l-4 border-[var(--border)] bg-[var(--card)]';
    }
  };

  const activeOrders = assignedTables.filter(table => table.orderCount > 0).length;
  const totalEarnings = assignedTables.reduce((sum, table) => sum + table.totalAmount, 0);

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 lg:space-y-8">
      {/* Performance Overview Cards - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg transition-all duration-200 bg-gradient-to-br from-[var(--sidebar)] to-[var(--sidebar-accent)]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[var(--secondary)] rounded-xl mx-auto mb-3">
              <Utensils className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--secondary-foreground)]" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-white">{assignedTables.length}</div>
            <p className="text-xs lg:text-sm text-[var(--secondary)] font-medium">Assigned Tables</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg transition-all duration-200 bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <ClipboardList className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--primary)]" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-[var(--card)]">{activeOrders}</div>
            <p className="text-xs lg:text-sm text-[var(--card)]/90 font-medium">Active Orders</p>
          </CardContent>
        </Card>

        {/* Desktop-only additional stats */}
        <Card className="hidden lg:block border-0 shadow-lg transition-all duration-200 bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-[var(--secondary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--secondary-foreground)]">${totalEarnings.toFixed(0)}</div>
            <p className="text-sm text-[var(--secondary-foreground)]/80 font-medium">Today&apos;s Revenue</p>
          </CardContent>
        </Card>

        <Card className="hidden lg:block border-0 shadow-lg transition-all duration-200 bg-gradient-to-br from-[var(--destructive)] to-[var(--destructive)]">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <Star className="w-6 h-6 text-[var(--destructive)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--card)]">{shiftStats.customerRating}</div>
            <p className="text-sm text-[var(--card)]/90 font-medium">Rating Today</p>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Layout: Two Column */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
        {/* Left Column - Performance and Alert */}
        <div className="lg:col-span-1 space-y-6">
          {/* Shift Performance Metrics */}
          <Card className="border-0 shadow-lg bg-[var(--card)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-[var(--foreground)]">
                  Today&apos;s Performance
                </CardTitle>
                <Badge className="bg-[var(--secondary)] text-[var(--secondary-foreground)] px-3 py-1 rounded-full">
                  <Star className="w-3 h-3 mr-1" />
                  {shiftStats.customerRating}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 lg:gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-[var(--primary)]/20 rounded-xl mx-auto mb-2">
                    <Target className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[var(--primary)]">{shiftStats.ordersCompleted}</div>
                  <div className="text-xs font-medium text-[var(--muted-foreground)]">Orders Completed</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-[var(--secondary)]/20 rounded-xl mx-auto mb-2">
                    <DollarSign className="w-5 h-5 text-[var(--secondary)]" />
                  </div>
                  <div className="text-xl lg:text-2xl font-bold text-[var(--secondary)]">${shiftStats.totalEarnings}</div>
                  <div className="text-xs font-medium text-[var(--muted-foreground)]">Tips Earned</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-[var(--foreground)]">Efficiency Score</span>
                  <span className="text-[var(--primary)] font-bold">{shiftStats.efficiency}%</span>
                </div>
                <Progress value={shiftStats.efficiency} className="h-3 rounded-full" />
                <div className="text-xs text-[var(--muted-foreground)]">
                  Avg service time: {shiftStats.averageServiceTime} • 3h 20m remaining
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Priority Alert */}
          <Card className="bg-gradient-to-r from-[var(--destructive)] to-[#DC2626] border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <p className="font-bold text-white">Urgent: Table 12 Ready</p>
                    <p className="text-sm text-white/90">VIP business dinner needs immediate attention</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  className="bg-white text-[var(--destructive)] hover:bg-white/90 rounded-xl px-4 font-semibold"
                  asChild
                >
                  <Link href="/waiter/table/T-12">
                    Handle Now
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:grid lg:grid-cols-1 gap-4">
            <Button 
              className="h-16 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link href="/waiter/orders">
                <div className="flex items-center space-x-3">
                  <ClipboardList className="w-6 h-6" />
                  <span>View All Orders</span>
                </div>
              </Link>
            </Button>
            
            <Button 
              className="h-16 bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] text-[var(--secondary-foreground)] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              asChild
            >
              <Link href="/waiter/qr">
                <div className="flex items-center space-x-3">
                  <Timer className="w-6 h-6" />
                  <span>Manage QR Codes</span>
                </div>
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Column - Tables */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--foreground)]">My Tables</h2>
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              <span className="text-[var(--muted-foreground)]">
                {assignedTables.length} tables assigned
              </span>
            </div>
          </div>
          
          <div className="grid gap-4 lg:gap-6 lg:grid-cols-2">
            {assignedTables.map((table) => (
              <Card 
                key={table.id} 
                className={`border-0 shadow-md hover:shadow-lg transition-all duration-200 ${getPriorityColor(table.priority)}`}
              >
                <CardContent className="p-4 lg:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${getStatusColor(table.status)} flex items-center justify-center text-white shadow-lg`}>
                        {getStatusIcon(table.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-[var(--foreground)]">Table {table.number}</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">{table.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getStatusColor(table.status)} text-white text-xs px-3 py-1 rounded-full`}>
                        {getStatusText(table.status)}
                      </Badge>
                      {table.priority === 'urgent' && (
                        <div className="text-xs text-[var(--destructive)] font-bold mt-1 animate-pulse">
                          🚨 URGENT
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <span className="text-[var(--foreground)]">
                        {table.currentGuests}/{table.capacity} guests
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-[var(--muted-foreground)]" />
                      <span className="text-[var(--foreground)]">
                        {table.lastActivity}
                      </span>
                    </div>
                  </div>

                  {table.orderCount > 0 && (
                    <div className="p-3 lg:p-4 rounded-xl mb-4 bg-[var(--background)]/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold text-[var(--foreground)]">{table.orderId}</span>
                        <span className="text-sm text-[var(--muted-foreground)]">{table.orderTime}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[var(--muted-foreground)]">Est. {table.estimatedTime}</span>
                        {table.totalAmount > 0 && (
                          <span className="font-bold text-[var(--primary)]">${table.totalAmount}</span>
                        )}
                      </div>
                      {table.orderItems.length > 0 && (
                        <div className="text-xs text-[var(--muted-foreground)]">
                          {table.orderItems.slice(0, 2).join(', ')}
                          {table.orderItems.length > 2 && ` +${table.orderItems.length - 2} more`}
                        </div>
                      )}
                    </div>
                  )}

                  {table.customerNotes && (
                    <div className="bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 p-3 rounded-xl mb-4">
                      <p className="text-xs text-[var(--secondary)] font-medium">
                        📝 {table.customerNotes}
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button 
                      className="flex-1 bg-[var(--sidebar)] hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] rounded-xl h-12 text-sm font-semibold transition-all duration-200"
                      asChild
                    >
                      <Link href={`/waiter/orders?table=${table.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Orders
                      </Link>
                    </Button>
                    
                    {table.status === 'served' && (
                      <Button 
                        className="border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] rounded-xl h-12 px-4 font-semibold transition-all duration-200"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/waiter/payment/${table.id}`}>
                          <DollarSign className="w-4 h-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions - Visible only on mobile */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        <Button 
          className="h-16 bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-[var(--primary-foreground)] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          asChild
        >
          <Link href="/waiter/orders">
            <div className="text-center">
              <ClipboardList className="w-6 h-6 mx-auto mb-1" />
              <span>All Orders</span>
            </div>
          </Link>
        </Button>
        
        <Button 
          className="h-16 bg-gradient-to-r from-[var(--secondary)] to-[var(--secondary)] text-[var(--secondary-foreground)] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          asChild
        >
          <Link href="/waiter/qr">
            <div className="text-center">
              <Timer className="w-6 h-6 mx-auto mb-1" />
              <span>QR Codes</span>
            </div>
          </Link>
        </Button>
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-4 md:h-0"></div>
    </div>
  );
}