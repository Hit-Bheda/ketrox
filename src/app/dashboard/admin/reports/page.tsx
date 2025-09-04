"use client";
import { useEffect, useState } from "react";
import {
  Download,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  Star,
  Target,
  BarChart3,
  PieChart,
  FileText,
  RefreshCw,
  Share2
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { format } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";



const categoryData = [
  { name: "Main Courses", value: 45, color: "#hsl(var(--chart-1))" },
  { name: "Appetizers", value: 25, color: "#hsl(var(--chart-2))" },
  { name: "Desserts", value: 18, color: "#hsl(var(--chart-3))" },
  { name: "Beverages", value: 8, color: "#hsl(var(--chart-4))" },
  { name: "Wines", value: 4, color: "#hsl(var(--chart-5))" }
];

type Order = {
  id: string;
  tableId: string;
  tableNumber: string;
  tenantId: string;
  managerId: string;
  customerName: string;
  items: string[];
  quantity: string[];
  status: "pending" | "completed" | "cancelled" | string;
  totalPrice: string;
  createdAt: string;
  updatedAt: string;
  managerName: string;
  orderNumber: string;
  itemNames: string[];
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: string[];
  quantities: string[];
  prices: string[];
  subtotal: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
};


export default function Reports() {
  const [dateRange, setDateRange] = useState("today");
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
     const [menuMap, setMenuMap] = useState<{ [id: string]: string }>({});


  const exportData = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // In a real app, this would generate and download the file
  };

  const refreshData = () => {
    console.log("Refreshing analytics data...");
    // In a real app, this would fetch fresh data
  };


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "/api/orders",
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store"
          }
        );
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
        console.log("menu", data);

      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, []);


    const tablePerformance = (() => {
    if (!orders.length) return [];
    const tableStats: Record<string, { orders: number; revenue: number }> = {};
    orders.forEach((order: Order) => {
      const table = order.tableNumber || "Unknown";
      if (!tableStats[table]) tableStats[table] = { orders: 0, revenue: 0 };
      tableStats[table].orders += 1;
      tableStats[table].revenue += parseFloat(order.totalPrice);
    });
    const maxOrders = Math.max(...Object.values(tableStats).map(t => t.orders), 1);
    return Object.entries(tableStats).map(([table, stats]) => ({
      table,
      orders: stats.orders,
      revenue: stats.revenue,
      utilization: Math.round((stats.orders / maxOrders) * 100)
    }));
  })();


    const fetchInvoices = async () => {
      try {
      
        const response = await fetch("/api/admin/invoices");
        const data = await response.json();
        if (response.ok) {
          setInvoices(data.invoices || []);
          console.log("invoices", data);
        } else {
          toast.error("Failed to fetch invoices");
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
        toast.error("Failed to fetch invoices");
      }
    };

    useEffect(() => {
      fetchInvoices();
    }, []);

   

  useEffect(() => {
    fetch("/api/admin/menu")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.menu)) {
          const map: { [id: string]: string } = {};
          type MenuItem = { id: string; item_name: string };
          data.menu.forEach((item: MenuItem) => {
            map[item.id] = item.item_name;
          });
          setMenuMap(map);
        }
      });
  }, []);


   const topMenuItems = (() => {
    if (!invoices.length || !Object.keys(menuMap).length) return [];
    // Aggregate stats for each item
    const itemStats: Record<string, { name: string; orders: number; revenue: number }> = {};
    invoices.forEach(inv => {
      inv.items.forEach((itemId, idx) => {
        const name = menuMap[itemId] || itemId;
        const qty = parseInt(inv.quantities[idx] || "1", 10);
        const price = parseFloat(inv.prices[idx] || "0");
        if (!itemStats[itemId]) itemStats[itemId] = { name, orders: 0, revenue: 0 };
        itemStats[itemId].orders += qty;
        itemStats[itemId].revenue += price * qty;
      });
    });
    // Convert to array and sort by orders desc
    const itemsArr = Object.values(itemStats).sort((a, b) => b.orders - a.orders);
    // Add performance label
    return itemsArr.map(item => ({
      ...item,
      performance: item.orders > 150 ? "Excellent" : item.orders > 100 ? "Good" : "Average"
    })).slice(0, 8); // Top 8 items
  })();


  const salesData = Object.values(
    orders.reduce((acc: Record<string, { date: string, revenue: number, orders: number }>, order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 };
      acc[date].revenue += parseFloat(order.totalPrice);
      acc[date].orders += 1;
      return acc;
    }, {})
  );


const hourlyData = Array.from({ length: 24 }, (_, i) => {
  const hourOrders = orders.filter(order => {
    const orderHour = new Date(order.createdAt).getHours();
    return orderHour === i;
  });
  return {
    hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? ' AM' : ' PM'}`,
    orders: hourOrders.length,
    revenue: hourOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
  };
}).filter(h => h.orders > 0);

  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalRevenue / totalOrders;
  const peakHour = hourlyData.length > 0 ? hourlyData.reduce((max, hour) => hour.orders > max.orders ? hour : max, hourlyData[0]) : { hour: '-', orders: 0, revenue: 0 };

    const paymentMethodStats = (() => {
    if (!invoices.length) return [];
    const totals: Record<string, { amount: number; count: number }> = {};
    let grandTotal = 0;
    invoices.forEach(inv => {
      const method = inv.paymentMethod || "Unknown";
      const amt = parseFloat(inv.totalAmount) || 0;
      if (!totals[method]) totals[method] = { amount: 0, count: 0 };
      totals[method].amount += amt;
      totals[method].count += 1;
      grandTotal += amt;
    });
    return Object.entries(totals).map(([method, { amount, count }]) => ({
      method,
      amount,
      count,
      percentage: grandTotal ? Math.round((amount / grandTotal) * 100) : 0
    }));
  })();
 

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into your restaurant performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refreshData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">${totalRevenue.toFixed(2)}</div>
              <div className="flex items-center space-x-1 text-xs text-chart-3 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+12.5% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{totalOrders}</div>
              <div className="flex items-center space-x-1 text-xs text-chart-3 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+8.2% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Target className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">${avgOrderValue.toFixed(2)}</div>
              <div className="flex items-center space-x-1 text-xs text-chart-3 mt-1">
                <TrendingUp className="w-3 h-3" />
                <span>+4.1% from last period</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hour</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{peakHour.hour}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {peakHour.orders} orders, ${peakHour.revenue.toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5" />
                    <span>Revenue Trend</span>
                  </CardTitle>
                  <CardDescription>Daily revenue over the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                        formatter={(value) => [
                          `$${Number(value).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`,
                          'Revenue',
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--chart-1))"
                        fill="hsl(var(--chart-1))"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sales by Category */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Sales by Category</span>
                  </CardTitle>
                  <CardDescription>Revenue distribution across menu categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(var(--chart-${index + 1}))`} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Hourly Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours Analysis</CardTitle>
                  <CardDescription>Orders and revenue by hour of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === 'revenue'
                            ? [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']
                            : [value, 'Orders']
                        }
                      />
                      <Bar dataKey="orders" fill="#f59e0a" />
                      <Bar dataKey="revenue" fill="#f59e0a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Revenue breakdown by payment type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'Cash', color: 'bg-chart-1' },
                    { key: 'Card', color: 'bg-chart-2' },
                    { key: 'UPI', color: 'bg-chart-3' },
                    { key: 'Bank Transfer', color: 'bg-chart-4' }
                  ].slice(0, 4).map((pm) => {
                    const stat = paymentMethodStats.find(m => m.method.toLowerCase() === pm.key.toLowerCase()) || { method: pm.key, amount: 0, percentage: 0 };
                    return (
                      <div key={pm.key} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{pm.key}</span>
                          <span className="font-medium">${stat.amount.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${pm.color}`}
                            style={{ width: `${stat.percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground">{stat.percentage}% of total</div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Menu Items</CardTitle>
                <CardDescription>Best selling items ranked by orders and revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topMenuItems.map((item, index) => (
                      <TableRow key={item.name}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                              {index + 1}
                            </Badge>
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell>${item.revenue.toLocaleString()}</TableCell>
                       
                        <TableCell>
                          <Badge
                            className={
                              item.orders > 150 ? "bg-chart-3 text-white" :
                                item.orders > 100 ? "bg-chart-4 text-white" :
                                  "bg-chart-5 text-white"
                            }
                          >
                            {item.orders > 150 ? "Excellent" : item.orders > 100 ? "Good" : "Average"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Table Performance Analysis</CardTitle>
                <CardDescription>Revenue and utilization metrics by table</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
           
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablePerformance.map((table) => (
                      <TableRow key={table.table}>
                        <TableCell className="font-medium">{table.table}</TableCell>
                        <TableCell>{table.orders}</TableCell>
                        <TableCell>${table.revenue.toLocaleString()}</TableCell>
                       
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-muted rounded-full h-2 max-w-[60px]">
                              <div
                                className={`h-2 rounded-full ${table.utilization > 90 ? 'bg-chart-3' :
                                  table.utilization > 75 ? 'bg-chart-4' :
                                    'bg-chart-5'
                                  }`}
                                style={{ width: `${table.utilization}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{table.utilization}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Reports</span>
            </CardTitle>
            <CardDescription>Download comprehensive reports in various formats</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => exportData('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportData('excel')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
