"use client";
import { useState } from "react";
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

// Sample data for charts
const salesData = [
  { date: "2024-01-08", revenue: 2400, orders: 42, customers: 38 },
  { date: "2024-01-09", revenue: 1800, orders: 35, customers: 32 },
  { date: "2024-01-10", revenue: 3200, orders: 58, customers: 51 },
  { date: "2024-01-11", revenue: 2800, orders: 48, customers: 44 },
  { date: "2024-01-12", revenue: 4100, orders: 72, customers: 65 },
  { date: "2024-01-13", revenue: 3600, orders: 63, customers: 58 },
  { date: "2024-01-14", revenue: 4500, orders: 79, customers: 71 },
  { date: "2024-01-15", revenue: 3900, orders: 69, customers: 62 }
];

const hourlyData = [
  { hour: "9 AM", orders: 5, revenue: 280 },
  { hour: "10 AM", orders: 8, revenue: 450 },
  { hour: "11 AM", orders: 12, revenue: 720 },
  { hour: "12 PM", orders: 25, revenue: 1450 },
  { hour: "1 PM", orders: 32, revenue: 1890 },
  { hour: "2 PM", orders: 28, revenue: 1650 },
  { hour: "3 PM", orders: 15, revenue: 890 },
  { hour: "4 PM", orders: 10, revenue: 580 },
  { hour: "5 PM", orders: 18, revenue: 1040 },
  { hour: "6 PM", orders: 35, revenue: 2100 },
  { hour: "7 PM", orders: 42, revenue: 2580 },
  { hour: "8 PM", orders: 38, revenue: 2350 },
  { hour: "9 PM", orders: 28, revenue: 1720 },
  { hour: "10 PM", orders: 15, revenue: 920 }
];

const topMenuItems = [
  { name: "Dry-Aged Ribeye", orders: 156, revenue: 10140, rating: 4.9 },
  { name: "Chocolate Soufflé", orders: 178, revenue: 2848, rating: 4.7 },
  { name: "Seared Scallops", orders: 89, revenue: 2136, rating: 4.9 },
  { name: "Lobster Risotto", orders: 134, revenue: 6432, rating: 4.8 },
  { name: "Truffle Burrata", orders: 142, revenue: 2556, rating: 4.8 },
  { name: "Chilean Sea Bass", orders: 98, revenue: 4116, rating: 4.6 },
  { name: "Tiramisu", orders: 203, revenue: 2436, rating: 4.5 },
  { name: "Craft Cold Brew", orders: 312, revenue: 2028, rating: 4.4 }
];

const categoryData = [
  { name: "Main Courses", value: 45, color: "#hsl(var(--chart-1))" },
  { name: "Appetizers", value: 25, color: "#hsl(var(--chart-2))" },
  { name: "Desserts", value: 18, color: "#hsl(var(--chart-3))" },
  { name: "Beverages", value: 8, color: "#hsl(var(--chart-4))" },
  { name: "Wines", value: 4, color: "#hsl(var(--chart-5))" }
];

const paymentMethodData = [
  { method: "Credit Card", percentage: 68, amount: 15240 },
  { method: "Cash", percentage: 22, amount: 4920 },
  { method: "Mobile Pay", percentage: 7, amount: 1560 },
  { method: "Bank Transfer", percentage: 3, amount: 680 }
];

const tablePerformance = [
  { table: "T001", orders: 24, revenue: 1890, avgTime: "1h 20m", utilization: 85 },
  { table: "T002", orders: 28, revenue: 2340, avgTime: "1h 45m", utilization: 92 },
  { table: "T003", orders: 18, revenue: 1450, avgTime: "55m", utilization: 78 },
  { table: "T004", orders: 12, revenue: 2100, avgTime: "2h 30m", utilization: 65 },
  { table: "T005", orders: 32, revenue: 1680, avgTime: "45m", utilization: 95 },
  { table: "T007", orders: 16, revenue: 1920, avgTime: "1h 15m", utilization: 72 },
  { table: "T008", orders: 14, revenue: 2580, avgTime: "2h 10m", utilization: 68 }
];

export default function Reports() {
  const [dateRange, setDateRange] = useState("7days");
  const [activeTab, setActiveTab] = useState("overview");

  const exportData = (format: string) => {
    console.log(`Exporting data in ${format} format`);
    // In a real app, this would generate and download the file
  };

  const refreshData = () => {
    console.log("Refreshing analytics data...");
    // In a real app, this would fetch fresh data
  };

  // Calculate key metrics
  const totalRevenue = salesData.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = salesData.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;
  const peakHour = hourlyData.reduce((max, hour) => hour.orders > max.orders ? hour : max, hourlyData[0]);

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
              <div className="text-2xl font-bold text-chart-1">${totalRevenue.toLocaleString()}</div>
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
                {peakHour.orders} orders, ${peakHour.revenue}
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
                        formatter={(value) => [`$${value}`, 'Revenue']}
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
                      <Tooltip />
                      <Bar dataKey="orders" fill="hsl(var(--chart-2))" />
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
                  {paymentMethodData.map((method, index) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{method.method}</span>
                        <span className="font-medium">${method.amount.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full bg-chart-${index + 1}`}
                          style={{ width: `${method.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground">{method.percentage}% of total</div>
                    </div>
                  ))}
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
                      <TableHead>Rating</TableHead>
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
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-chart-4 fill-current" />
                            <span>{item.rating}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              item.orders > 150 ? "bg-chart-3 text-foreground" :
                              item.orders > 100 ? "bg-chart-4 text-foreground" :
                              "bg-chart-5 text-foreground"
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
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Utilization</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablePerformance.map((table) => (
                      <TableRow key={table.table}>
                        <TableCell className="font-medium">{table.table}</TableCell>
                        <TableCell>{table.orders}</TableCell>
                        <TableCell>${table.revenue.toLocaleString()}</TableCell>
                        <TableCell>{table.avgTime}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="w-full bg-muted rounded-full h-2 max-w-[60px]">
                              <div 
                                className={`h-2 rounded-full ${
                                  table.utilization > 90 ? 'bg-chart-3' :
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
