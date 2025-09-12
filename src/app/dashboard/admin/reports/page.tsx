"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Download,
  DollarSign,
  ShoppingCart,
  Clock,
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
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

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
import { DateRange } from "react-day-picker";
import { Invoice, OrderType } from "@/types";

export default function Reports() {
  const [dateRange, setDateRange] = useState("today");
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const [activeTab, setActiveTab] = useState("overview");
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [menuMap, setMenuMap] = useState<{ [id: string]: string }>({});
  const [isExporting, setIsExporting] = useState(false);


  // Date filtering helper function
  const getDateRangeFilter = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    if (dateRange === "custom" && customDateRange?.from) {
      startDate = startOfDay(customDateRange.from);
      endDate = customDateRange.to ? endOfDay(customDateRange.to) : endOfDay(customDateRange.from);
    } else {
      switch (dateRange) {
        case "today":
          startDate = startOfDay(now);
          break;
        case "7days":
          startDate = startOfDay(subDays(now, 7));
          break;
        case "30days":
          startDate = startOfDay(subDays(now, 30));
          break;
        case "90days":
          startDate = startOfDay(subDays(now, 90));
          break;
        default:
          startDate = startOfDay(now);
      }
    }

    return { startDate, endDate };
  }, [dateRange, customDateRange]);

  // Filter orders based on date range
  const filteredOrders = useMemo(() => {
    const { startDate, endDate } = getDateRangeFilter;
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return isWithinInterval(orderDate, { start: startDate, end: endDate });
    });
  }, [orders, getDateRangeFilter]);

  // Filter invoices based on date range
  const filteredInvoices = useMemo(() => {
    const { startDate, endDate } = getDateRangeFilter;
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return isWithinInterval(invoiceDate, { start: startDate, end: endDate });
    });
  }, [invoices, getDateRangeFilter]);

  const exportData = async (format: string) => {
    setIsExporting(true);
    try {
      const { startDate, endDate } = getDateRangeFilter;
      const exportData = {
        dateRange: {
          from: startDate.toISOString().split('T')[0],
          to: endDate.toISOString().split('T')[0]
        },
        summary: {
          totalRevenue,
          totalOrders,
          avgOrderValue,
          peakHour
        },
        overview: {
          salesData,
          categoryData
        },
        sales: {
          hourlyData,
          paymentMethodStats
        },
        menu: {
          topMenuItems
        },
        operations: {
          tablePerformance
        },
        orders: filteredOrders,
        invoices: filteredInvoices
      };

      if (format === 'csv') {
        const csvRows: (string | number)[][] = [];

        // Title
        csvRows.push([`RESTAURANT REPORTS`]);
        csvRows.push([`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`]);
        csvRows.push([]);

        // Summary
        csvRows.push(['SUMMARY']);
        csvRows.push(['Total Revenue', `$${totalRevenue.toFixed(2)}`]);
        csvRows.push(['Total Orders', totalOrders]);
        csvRows.push(['Average Order Value', `$${avgOrderValue.toFixed(2)}`]);
        csvRows.push(['Peak Hour', peakHour.hour]);
        csvRows.push([]);

        // Top Menu Items
        csvRows.push(['TOP MENU ITEMS']);
        csvRows.push(['Item Name', 'Orders', 'Revenue', 'Performance']);
        topMenuItems.forEach(item => {
          csvRows.push([item.name, item.orders, `$${item.revenue.toFixed(2)}`, item.performance]);
        });
        csvRows.push([]);

        // Table Performance
        csvRows.push(['TABLE PERFORMANCE']);
        csvRows.push(['Table', 'Orders', 'Revenue', 'Utilization']);
        tablePerformance.forEach(table => {
          csvRows.push([table.table, table.orders, `$${table.revenue.toFixed(2)}`, `${table.utilization}%`]);
        });
        csvRows.push([]);

        // Payment Methods
        csvRows.push(['PAYMENT METHODS']);
        csvRows.push(['Method', 'Amount', 'Count', 'Percentage']);
        paymentMethodStats.forEach(pm => {
          csvRows.push([pm.method, `$${pm.amount.toFixed(2)}`, pm.count, `${pm.percentage}%`]);
        });
        csvRows.push([]);

        // Orders Detail
        csvRows.push(['ORDERS DETAIL']);
        csvRows.push(['Order ID', 'Table', 'Customer', 'Total', 'Status', 'Date']);
        filteredOrders.forEach(order => {
          csvRows.push([
            order.orderNumber,
            order.tableNumber,
            order.customerName,
            `$${order.totalPrice}`,
            order.status,
            new Date(order.createdAt).toLocaleString()
          ]);
        });

        // Convert rows → CSV string
        const csvContent = csvRows.map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
      else if (format === 'json') {
        // Export as JSON
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        // Export as PDF using jsPDF
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        // Title
        doc.setFontSize(20);
        doc.text('Restaurant Reports & Analytics', 20, 20);

        // Date Range
        doc.setFontSize(12);
        doc.text(`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, 20, 35);

        // Summary Section
        doc.setFontSize(16);
        doc.text('Summary', 20, 55);
        doc.setFontSize(12);
        doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 20, 70);
        doc.text(`Total Orders: ${totalOrders}`, 20, 80);
        doc.text(`Average Order Value: $${avgOrderValue.toFixed(2)}`, 20, 90);
        doc.text(`Peak Hour: ${peakHour.hour}`, 20, 100);

        // Top Menu Items
        doc.setFontSize(16);
        doc.text('Top Menu Items', 20, 120);
        doc.setFontSize(10);
        let yPos = 135;
        topMenuItems.slice(0, 10).forEach((item, index) => {
          doc.text(`${index + 1}. ${item.name} - ${item.orders} orders - $${item.revenue.toFixed(2)}`, 20, yPos);
          yPos += 10;
        });

        // Table Performance
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(16);
        doc.text('Table Performance', 20, yPos);
        yPos += 15;
        doc.setFontSize(10);
        tablePerformance.slice(0, 15).forEach((table) => {
          doc.text(`Table ${table.table}: ${table.orders} orders - $${table.revenue.toFixed(2)} - ${table.utilization}% utilization`, 20, yPos);
          yPos += 10;
        });

        // Save PDF
        doc.save(`reports_${new Date().toISOString().split('T')[0]}.pdf`);
      } else if (format === 'excel') {
        const excelContent = [
          ['RESTAURANT REPORTS'],
          [`Date Range: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`],
          [''],
          ['SUMMARY'],
          ['Total Revenue', `$${totalRevenue.toFixed(2)}`],
          ['Total Orders', totalOrders],
          ['Average Order Value', `$${avgOrderValue.toFixed(2)}`],
          ['Peak Hour', peakHour.hour],
          [''],
          ['TOP MENU ITEMS'],
          ['Item Name', 'Orders', 'Revenue', 'Performance'],
          ...topMenuItems.map(item => [item.name, item.orders, `$${item.revenue.toFixed(2)}`, item.performance]),
          [''],
          ['TABLE PERFORMANCE'],
          ['Table', 'Orders', 'Revenue', 'Utilization'],
          ...tablePerformance.map(table => [table.table, table.orders, `$${table.revenue.toFixed(2)}`, `${table.utilization}%`]),
          [''],
          ['PAYMENT METHODS'],
          ['Method', 'Amount', 'Count', 'Percentage'],
          ...paymentMethodStats.map(pm => [pm.method, `$${pm.amount.toFixed(2)}`, pm.count, `${pm.percentage}%`]),
          [''],
          ['ORDERS DETAIL'],
          ['Order ID', 'Table', 'Customer', 'Total', 'Status', 'Date'],
          ...filteredOrders.map(order => [
            order.orderNumber,
            order.tableNumber,
            order.customerName,
            `$${order.totalPrice}`,
            order.status,
            new Date(order.createdAt).toLocaleString()
          ])
        ].map(row => Array.isArray(row) ? row.join(',') : row).join('\n');

        const blob = new Blob([excelContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reports_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }

      toast.success(`Report exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const refreshData = async () => {
    try {

      const ordersRes = await fetch("/api/orders", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      }

      // Fetch invoices
      const invoicesRes = await fetch("/api/admin/invoices");
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        setInvoices(invoicesData.invoices || []);
      }

      // Fetch menu
      const menuRes = await fetch("/api/admin/menu");
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        if (Array.isArray(menuData.menu)) {
          const map: { [id: string]: string } = {};
          type MenuItem = { id: string; item_name: string };
          menuData.menu.forEach((item: MenuItem) => {
            map[item.id] = item.item_name;
          });
          setMenuMap(map);
        }
      }


      toast.success(`Data refreshed successfully for ${dateRange === 'custom' ? 'custom date range' : dateRange}`);
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast.error("Failed to refresh data");
    }
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

  const tablePerformance = useMemo(() => {
    if (!filteredOrders.length) return [];
    const tableStats: Record<string, { orders: number; revenue: number }> = {};
    filteredOrders.forEach((order: OrderType) => {
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
  }, [filteredOrders]);


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

  const topMenuItems = useMemo(() => {
    if (!filteredInvoices.length || !Object.keys(menuMap).length) return [];
    // Aggregate stats for each item
    const itemStats: Record<string, { name: string; orders: number; revenue: number }> = {};
    filteredInvoices.forEach(inv => {
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
  }, [filteredInvoices, menuMap]);


  const salesData = useMemo(() => Object.values(
    filteredOrders.reduce((acc: Record<string, { date: string, revenue: number, orders: number }>, order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!acc[date]) acc[date] = { date, revenue: 0, orders: 0 };
      acc[date].revenue += parseFloat(order.totalPrice);
      acc[date].orders += 1;
      return acc;
    }, {})
  ), [filteredOrders]);


  const hourlyData = useMemo(() => Array.from({ length: 24 }, (_, i) => {
    const hourOrders = filteredOrders.filter(order => {
      const orderHour = new Date(order.createdAt).getHours();
      return orderHour === i;
    });
    return {
      hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? ' AM' : ' PM'}`,
      orders: hourOrders.length,
      revenue: hourOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0)
    };
  }).filter(h => h.orders > 0), [filteredOrders]);

  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, order) => sum + parseFloat(order.totalPrice), 0), [filteredOrders]);
  const totalOrders = useMemo(() => filteredOrders.length, [filteredOrders]);
  const avgOrderValue = useMemo(() => totalOrders > 0 ? totalRevenue / totalOrders : 0, [totalRevenue, totalOrders]);
  const peakHour = useMemo(() => hourlyData.length > 0 ? hourlyData.reduce((max, hour) => hour.orders > max.orders ? hour : max, hourlyData[0]) : { hour: '-', orders: 0, revenue: 0 }, [hourlyData]);

  const paymentMethodStats = useMemo(() => {
    if (!filteredInvoices.length) return [];
    const totals: Record<string, { amount: number; count: number }> = {};
    let grandTotal = 0;
    filteredInvoices.forEach(inv => {
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
  }, [filteredInvoices]);

  // Dynamic category data based on payment methods
  const categoryData = useMemo(() => {
    if (!paymentMethodStats.length) {

      return [
        { name: "No Data", value: 100, color: "#f59f0a" }
      ];
    }

    return paymentMethodStats.map((method) => ({
      name: method.method,
      value: method.percentage,
      color: "#f59f0a"
    }));
  }, [paymentMethodStats]);


  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-auto ">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === "custom" && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md"
                  value={customDateRange?.from ? customDateRange.from.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setCustomDateRange((prev) => ({
                      from: date,
                      to: prev?.to ?? undefined,
                    }));
                  }}
                />
                <span className="text-center sm:text-left">to</span>
                <input
                  type="date"
                  className="px-3 py-2 border rounded-md"
                  value={customDateRange?.to ? customDateRange.to.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setCustomDateRange((prev) => ({
                      from: prev?.from ?? undefined,
                      to: date,
                    }));
                  }}
                />
              </div>
            )}

            <Button
              variant="outline"
              className="  w-full sm:w-auto"
              onClick={refreshData}
            >
              <RefreshCw className="w-4 h-4 mr-1 sm:mr-2" />
              Refresh
            </Button>

            <Button
              variant="outline"
              className=" w-full sm:w-auto"
              disabled={isExporting}
              onClick={() => exportData("csv")}
            >
              <Download className="w-4 h-4 mr-1 sm:mr-2" />
              {isExporting ? "Exporting..." : "Export"}
            </Button>
          </div>
        </div>


        {/* Key Metrics */}
        {/* No Data Message */}
        {filteredOrders.length === 0 && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Data Found</h3>
                <p className="text-yellow-600">No data found for the selected date range. Try adjusting your date filter or check back later.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-1" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-1">${totalRevenue.toFixed(2)}</div>

            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">{totalOrders}</div>

            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
              <Target className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">${avgOrderValue.toFixed(2)}</div>

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

              {/* Sales by Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Sales by Payment Method</span>
                  </CardTitle>
                  <CardDescription>Revenue distribution across payment methods</CardDescription>
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
                          <Cell key={`cell-${index}`} fill={entry.color} />
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
              <Button variant="outline" disabled={isExporting} onClick={() => exportData('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" disabled={isExporting} onClick={() => exportData('excel')}>
                <BarChart3 className="w-4 h-4 mr-2" />
                Export Excel
              </Button>
              <Button variant="outline" disabled={isExporting} onClick={() => exportData('csv')}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" disabled={isExporting}>
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
