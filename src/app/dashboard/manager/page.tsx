"use client";

import { useState } from "react";
import { 
  DollarSign, 
  Clock,
  Users,
  ChefHat,
  CheckCircle,
  AlertCircle,
  Package,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Realistic dummy data
const kpiData = {
  activeOrders: 23,
  totalRevenue: 12847.50,
  pendingInvoices: 7,
  staffCount: 18,
  revenueChange: 12.5,
  ordersChange: -3.2,
  invoicesChange: 8.1,
  staffChange: 0
};

const dailyOrdersData = [
  { time: '9:00', orders: 5, revenue: 125 },
  { time: '10:00', orders: 8, revenue: 240 },
  { time: '11:00', orders: 12, revenue: 380 },
  { time: '12:00', orders: 25, revenue: 750 },
  { time: '13:00', orders: 32, revenue: 980 },
  { time: '14:00', orders: 28, revenue: 840 },
  { time: '15:00', orders: 15, revenue: 450 },
  { time: '16:00', orders: 10, revenue: 300 },
  { time: '17:00', orders: 18, revenue: 540 },
  { time: '18:00', orders: 22, revenue: 660 },
  { time: '19:00', orders: 35, revenue: 1050 },
  { time: '20:00', orders: 42, revenue: 1260 },
  { time: '21:00', orders: 38, revenue: 1140 },
  { time: '22:00', orders: 20, revenue: 600 }
];

const orderStatusData = [
  { status: 'Pending', count: 8, color: 'rgb(246, 216, 144)' },
  { status: 'Preparing', count: 12, color: 'rgb(163, 165, 249)' },
  { status: 'Ready', count: 5, color: 'rgb(199, 208, 190)' },
  { status: 'Delivered', count: 42, color: 'rgb(139, 141, 224)' }
];

const liveOrders = [
  { id: 'ORD-1234', table: 'Table 5', items: ['Grilled Salmon', 'Caesar Salad', 'Wine'], status: 'pending', time: '2 min ago', total: 89.50, customer: 'Sarah Johnson' },
  { id: 'ORD-1235', table: 'Table 12', items: ['Ribeye Steak', 'Mashed Potatoes', 'Beer'], status: 'preparing', time: '8 min ago', total: 125.00, customer: 'Michael Chen' },
  { id: 'ORD-1236', table: 'Table 3', items: ['Pasta Carbonara', 'Garlic Bread'], status: 'preparing', time: '12 min ago', total: 42.50, customer: 'Emma Wilson' },
  { id: 'ORD-1237', table: 'Table 8', items: ['Fish & Chips', 'Coleslaw', 'Soda'], status: 'ready', time: '5 min ago', total: 38.75, customer: 'David Brown' },
  { id: 'ORD-1238', table: 'Table 15', items: ['Chicken Tikka', 'Naan Bread', 'Lassi'], status: 'ready', time: '3 min ago', total: 67.25, customer: 'Priya Patel' },
  { id: 'ORD-1239', table: 'Table 7', items: ['Burger & Fries', 'Milkshake'], status: 'pending', time: '1 min ago', total: 28.90, customer: 'Alex Murphy' }
];

const recentActivity = [
  { id: 1, action: "New order placed", details: "Table 5 - Order #ORD-1234", time: "2 minutes ago", type: "order", user: "Sarah Johnson" },
  { id: 2, action: "Payment received", details: "Invoice #INV-456 - $125.00", time: "5 minutes ago", type: "payment", user: "Michael Chen" },
  { id: 3, action: "Staff check-in", details: "Maria Rodriguez started shift", time: "10 minutes ago", type: "staff", user: "Maria Rodriguez" },
  { id: 4, action: "Table reserved", details: "Table 12 for 6 people at 8:00 PM", time: "15 minutes ago", type: "reservation", user: "James Wilson" },
  { id: 5, action: "Order completed", details: "Table 8 - Order #ORD-1230", time: "18 minutes ago", type: "order", user: "Kitchen Staff" },
  { id: 6, action: "Inventory alert", details: "Salmon stock running low", time: "25 minutes ago", type: "alert", user: "System" }
];

export default function Dashboard() {
  // const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>('pending');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary text-secondary-foreground';
      case 'preparing':
        return 'bg-primary text-primary-foreground';
      case 'ready':
        return 'bg-chart-3 text-foreground';
      case 'delivered':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="w-4 h-4 text-primary" />;
      case 'payment':
        return <DollarSign className="w-4 h-4 text-chart-2" />;
      case 'staff':
        return <Users className="w-4 h-4 text-chart-3" />;
      case 'reservation':
        return <Clock className="w-4 h-4 text-chart-4" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // In a real app, this would update the backend
  };

  return (
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{kpiData.activeOrders}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                {kpiData.ordersChange > 0 ? (
                  <ArrowUpRight className="mr-1 h-3 w-3 text-chart-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3 text-destructive" />
                )}
                {Math.abs(kpiData.ordersChange)}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">${kpiData.totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="mr-1 h-3 w-3 text-chart-3" />
                {kpiData.revenueChange}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{kpiData.pendingInvoices}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="mr-1 h-3 w-3 text-chart-3" />
                {kpiData.invoicesChange}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300 ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Staff on Duty</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{kpiData.staffCount}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <CheckCircle className="mr-1 h-3 w-3 text-chart-3" />
                All positions covered
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Daily Orders Chart */}
          <Card className="col-span-4 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Today&apos;s Orders & Revenue</CardTitle>
              <CardDescription>Real-time tracking of orders and revenue by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyOrdersData}>
                  <defs>
                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(163, 165, 249)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgb(163, 165, 249)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="rgb(246, 216, 144)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="rgb(246, 216, 144)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(224, 224, 224)" />
                  <XAxis dataKey="time" stroke="rgb(117, 117, 117)" fontSize={12} />
                  <YAxis stroke="rgb(117, 117, 117)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgb(255, 255, 255)',
                      border: '1px solid rgb(224, 224, 224)',
                      borderRadius: '1rem',
                      boxShadow: '0px 4px 16px 0px hsl(0 0% 0% / 0.05)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="rgb(163, 165, 249)" 
                    fillOpacity={1}
                    fill="url(#ordersGradient)"
                    strokeWidth={2}
                    name="Orders"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="rgb(246, 216, 144)" 
                    fillOpacity={1}
                    fill="url(#revenueGradient)"
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Order Status Distribution */}
          <Card className="col-span-3 hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current distribution of order statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {orderStatusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-3 w-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-muted-foreground">{item.status}</span>
                    </div>
                    <span className="font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Orders and Recent Activity */}
        <div className="grid gap-6 md:grid-cols-7">
          {/* Live Orders */}
          <Card className="col-span-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <span>Live Orders</span>
                    <Badge className="bg-primary text-primary-foreground animate-pulse">LIVE</Badge>
                  </CardTitle>
                  <CardDescription>Real-time order management and status updates</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {liveOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-semibold text-sm">{order.id}</span>
                        <span className="text-sm text-muted-foreground">{order.table}</span>
                        <span className="text-sm text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{order.customer}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {order.items.join(', ')}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">${order.total}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{order.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <Select
                        value={order.status}
                        onValueChange={(value) => updateOrderStatus(order.id, value)}
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="preparing">Preparing</SelectItem>
                          <SelectItem value="ready">Ready</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system events and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 hover:bg-accent p-2 rounded-lg transition-colors">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.details}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {activity.user}
                        </p>
                        <div className="h-1 w-1 bg-muted-foreground rounded-full" />
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

  );
}
