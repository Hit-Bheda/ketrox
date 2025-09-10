"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";

import {
  DollarSign,
  Users,
  ChefHat,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  AlertCircle,
  Package,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
import { useEffect, useState, useMemo } from "react";
import { betterFetch } from "@better-fetch/fetch";
import { OrderType } from "@/types";

const STATUS_COLORS: Record<string, string> = {
  Pending: 'rgb(246, 216, 144)',
  Preparing: 'rgb(163, 165, 249)',
  Ready: 'rgb(199, 208, 190)',
  Delivered: 'rgb(46, 204, 113)'
};

const recentActivity = [
  { id: 1, action: "New order placed", details: "Table 5 - Order #ORD-1234", time: "2 minutes ago", type: "order", user: "Manager" },
  { id: 2, action: "Order status updated", details: "Order #ORD-1230 marked as ready", time: "5 minutes ago", type: "order", user: "Manager" },
  { id: 3, action: "Order completed", details: "Table 8 - Order #ORD-1228", time: "10 minutes ago", type: "order", user: "Manager" },
  { id: 4, action: "New order placed", details: "Table 12 - Order #ORD-1235", time: "15 minutes ago", type: "order", user: "Manager" }
];


export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string } | null>(null);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [staff, setStaff] = useState<{ id: string; name: string; role: string; status: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-secondary text-white';
      case 'preparing':
        return 'bg-primary text-white';
      case 'ready':
        return 'bg-chart-3 text-white';
      case 'delivered':
        return "bg-green-600 text-white";
      default:
        return 'bg-muted text-white';
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
          });
        }
        console.log("Fetched user session:", session);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const managerId = user?.id;
        const [ordersRes, staffRes] = await Promise.all([
          fetch(`/api/orders?managerId=${managerId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store"
          }),
          fetch('/api/admin/hotel')
        ]);

        if (!ordersRes.ok) throw new Error("Failed to fetch orders");
        if (!staffRes.ok) throw new Error("Failed to fetch staff");

        const ordersData = await ordersRes.json();
        const staffData = await staffRes.json();

        setOrders(ordersData.orders || []);
        setStaff(Array.isArray(staffData.staff) ? staffData.staff : []);
        setError(null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) fetchData();
  }, [user]);

  const getFilterFn = (dateRange: 'today' | 'week' | 'month' | 'all') => {
    const now = new Date();

    if (dateRange === 'today') {
      return (d: Date) => d.toDateString() === now.toDateString();
    } else if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 6);
      weekAgo.setHours(0, 0, 0, 0);
      return (d: Date) => d >= weekAgo && d <= now;
    } else if (dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setDate(now.getDate() - 29);
      monthAgo.setHours(0, 0, 0, 0);
      return (d: Date) => d >= monthAgo && d <= now;
    }
    return () => true;
  };

  const dailyOrdersData = useMemo(() => {
    const byHour: Record<string, { orders: number; revenue: number }> = {};

    const filterFn = getFilterFn(dateRange);

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (!filterFn(d)) return;

      const hour = `${d.getHours()}:00`;
      if (!byHour[hour]) byHour[hour] = { orders: 0, revenue: 0 };
      byHour[hour].orders += 1;
      byHour[hour].revenue += Number(o.totalPrice || 0);
    });

    const hours = Array.from({ length: 24 }, (_, h) => `${h}:00`);

    return hours.map(h => ({
      time: h,
      orders: byHour[h]?.orders || 0,
      revenue: byHour[h]?.revenue || 0,
    }));
  }, [orders, dateRange]);

  const kpiData = useMemo(() => {
    const filterFn = getFilterFn(dateRange);
    const filteredOrders = orders.filter(o => filterFn(new Date(o.createdAt)));
    const activeOrders = filteredOrders.filter(
      o => o.status !== "delivered" && o.status !== "cancelled"
    ).length;

    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + Number(o.totalPrice || 0),
      0
    );

    const waiterCount = staff.filter(member => member.role === 'waiter' && member.status === 'active').length;

    return {
      activeOrders,
      totalRevenue,
      pendingInvoices: 0,
      staffCount: waiterCount,
      revenueChange: 0,
      ordersChange: 0,
      invoicesChange: 0,
      staffChange: 0,
    };
  }, [orders, staff, dateRange]);

  const orderStatusData = useMemo(() => {
    const counts: Record<string, number> = { Pending: 0, Preparing: 0, Ready: 0, Delivered: 0 };

    const filterFn = getFilterFn(dateRange);

    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (!filterFn(d)) return;

      const key = (o.status.charAt(0).toUpperCase() + o.status.slice(1)) as keyof typeof counts;
      if (key in counts) counts[key] += 1;
    });

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
      color: STATUS_COLORS[status],
    }));
  }, [orders, dateRange]);

  const liveOrders = useMemo(() => {
    const filterFn = getFilterFn(dateRange);

    return orders
      .filter(o => filterFn(new Date(o.createdAt)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(o => ({
        id: o.orderNumber,
        table: `Table ${o.tableNumber ?? '-'}`,
        items: (o.itemNames && o.itemNames.length ? o.itemNames : o.items),
        status: o.status,
        time: timeAgo(o.createdAt),
        total: Number(o.totalPrice || 0).toFixed(2),
        customer: o.customerName,
         phone: o.customerPhone,
        orderId: o.id
      }));
  }, [orders, dateRange]);

  function timeAgo(dateString: string) {
    const then = new Date(dateString).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
    const days = Math.floor(hrs / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }


  return (
    <div className="flex-1 space-y-6 p-6 animate-fadeIn">
      {/* Date Range Filter */}
      <div className="flex items-center gap-4 mb-4">
        <span className="font-medium text-muted-foreground">Date Range:</span>
        <Select value={dateRange} onValueChange={v => setDateRange(v as 'today' | 'week' | 'month' | 'all')}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">Last Week</SelectItem>
            <SelectItem value="month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}
      {loading && (
        <div className="text-sm text-muted-foreground">Loading...</div>
      )}
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
            <div className="text-2xl font-bold text-chart-2">${kpiData.totalRevenue.toFixed(2)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 h-3 w-3 text-chart-3" />
              {kpiData.revenueChange}% from yesterday
            </div>
          </CardContent>
        </Card>


        <Card className="hover:shadow-lg transition-all duration-300 ">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Waiters on Duty</CardTitle>
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
                    <stop offset="5%" stopColor="rgb(163, 165, 249)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(163, 165, 249)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="rgb(246, 216, 144)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="rgb(246, 216, 144)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(224, 224, 224)" />
                <XAxis dataKey="time" stroke="rgb(117, 117, 117)" fontSize={12} />
                <YAxis
                  stroke="rgb(117, 117, 117)"
                  fontSize={12}
                  tickFormatter={(value) => value.toFixed(2)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgb(255, 255, 255)',
                    border: '1px solid rgb(224, 224, 224)',
                    borderRadius: '1rem',
                    boxShadow: '0px 4px 16px 0px hsl(0 0% 0% / 0.05)'
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Revenue ($)") {
                      return [`$${value.toFixed(2)}`, name];
                    }
                    return [value, name];
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
        <Card className="col-span-3 hover:shadow-lg transition-shadow  max-md:col-span-4 duration-300">
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
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{order.phone}</span>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-3  max-md:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest manager activities and updates</CardDescription>
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
