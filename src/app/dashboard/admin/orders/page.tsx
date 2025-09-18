"use client";

import { useEffect, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Clock,
  ChefHat,
  CheckCircle,
  Package,
  AlertTriangle,
  DollarSign,
  User,
  MapPin,
  Calendar,
  Trash2,
  Phone
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner";
import { OrderType } from "@/types";


export default function Orders() {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("today");
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [page, setPage] = useState(0);       // current page
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const now = new Date();

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    let matchesTime = true;
    const orderTime = new Date(order.createdAt);

    if (timeFilter === "today") {
      matchesTime =
        orderTime.getDate() === now.getDate() &&
        orderTime.getMonth() === now.getMonth() &&
        orderTime.getFullYear() === now.getFullYear();
    } else if (timeFilter === "lastWeek") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      matchesTime = orderTime >= oneWeekAgo && orderTime <= now;
    } else if (timeFilter === "lastMonth") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(now.getMonth() - 1);
      matchesTime = orderTime >= oneMonthAgo && orderTime <= now;
    }

    return matchesSearch && matchesStatus && matchesTime;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-600";
      case "preparing":
        return "bg-amber-600";
      case "delivered":
        return "bg-green-700";
      case "cancelled":
        return "bg-red-600";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusIcon = (status: string, size = 16) => {
    switch (status) {
      case "pending":
        return <Clock className={`w-[${size}px] h-[${size}px] text-white`} />;
      case "preparing":
        return <ChefHat className={`w-[${size}px] h-[${size}px] text-white`} />;
      case "delivered":
        return <CheckCircle className={`w-[${size}px] h-[${size}px] text-white`} />;
      case "cancelled":
        return <AlertTriangle className={`w-[${size}px] h-[${size}px] text-white`} />;
      default:
        return <AlertTriangle className={`w-[${size}px] h-[${size}px] text-white`} />;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Order updated successfully");
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        toast.error(data.error || "Failed to update status");
        console.error(data.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Something went wrong while updating order status");
      console.error("Error updating status:", error);
    }
  };

  const viewOrderDetails = (order: OrderType) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const stats = {
    total: filteredOrders.length,
    pending: filteredOrders.filter(o => o.status === "pending").length,
    preparing: filteredOrders.filter(o => o.status === "preparing").length,
    delivered: filteredOrders.filter(o => o.status === "delivered").length,
    totalValue: filteredOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0),
    avgOrderValue:
      filteredOrders.length > 0
        ? filteredOrders.reduce((sum, order) => sum + Number(order.totalPrice), 0) / filteredOrders.length
        : 0,
  };


  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders?page=${page}&limit=${limit}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        setOrders(data.orders || []);
        setTotal(data.pagination?.total || 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    fetchOrders();
  }, [page, limit]);

  const deleteOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(prev => prev.filter(o => o.id !== orderId));
        toast.success(data.message);
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to delete order");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              <ChefHat className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.preparing}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Package className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">{stats.delivered}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">${stats.totalValue.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Order</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">${stats.avgOrderValue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Live Orders</span>
                  <Badge className="bg-primary text-primary-foreground animate-pulse">LIVE</Badge>
                </CardTitle>
                <CardDescription>Real-time order management and kitchen coordination</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search orders, customers, or tables..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="lastWeek">Last Week</SelectItem>
                  <SelectItem value="lastMonth">Last Month</SelectItem>
                </SelectContent>
              </Select>

              {/* 👇 Add Limit Dropdown Here */}
              <Select value={limit.toString()} onValueChange={(val) => setLimit(Number(val))}>
                <SelectTrigger className="w-full sm:w-[100px]">
                  <SelectValue placeholder="Rows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg border overflow-hidden rounded-b-lg">
              <Table>
                <TableHeader className="">
                  <TableRow className={`hover:bg-muted/0 transition-colors ${filteredOrders.length > 0 ? "border-b" : "border-none"
                    }`}>
                    <TableHead>Order Details</TableHead>
                    <TableHead>Customer & Table</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-accent transition-colors">
                      <TableCell>
                        <div>
                          <p className="font-medium">{order.orderNumber || order.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {order.customerName?.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{order.customerName}</p>
                            <div className="flex flex-col items-start text-xs text-muted-foreground space-y-1">
                              <div className="flex items-center space-x-1">
                                <Phone className="w-3 h-3" />
                                <span>{order.customerPhone}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{order.tableNumber}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-sm truncate  cursor-pointer">
                                  {order.itemNames
                                    ?.map((name: string, i: number) => `${order.quantity?.[i]}x ${name}`)
                                    .join(", ")}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs text-gray-900 break-words">
                                {order.itemNames
                                  ?.map((name: string, i: number) => `${order.quantity?.[i]}x ${name}`)
                                  .join(", ")}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-xs text-muted-foreground">
                            {order.itemNames?.length} items
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={order.status}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger
                            className={`w-28 px-2 py-0 justify-center ${getStatusBadgeColor(order.status)} text-white rounded-full text-xs  cursor-pointer`}
                            style={{ minHeight: "1.5rem" }}
                          >
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(order.status, 14)}
                              <SelectValue className="capitalize text-white text-xs" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="preparing">Preparing</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>


                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span>
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })} •{" "}
                            {new Date(order.createdAt).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">${Number(order.totalPrice).toFixed(2)}</p>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover:bg-accent">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'preparing')}>
                              <ChefHat className="w-4 h-4 mr-2" />
                              Start Preparing
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              <Package className="w-4 h-4 mr-2" />
                              Order delivered
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'cancelled')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Cancelled
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteOrder(order.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">No orders found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setTimeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
          {/* Info Text */}
          <p className="text-sm text-muted-foreground">
            Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total} orders
          </p>

          {/* Pagination Controls */}
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {/* Prev Button */}
            <Button
              variant="outline"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(p - 1, 0))}
            >
              Prev
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => {
              // Only show first, last, current ±1, else show "..."
              if (
                i === 0 || // first page
                i === Math.ceil(total / limit) - 1 || // last page
                (i >= page - 1 && i <= page + 1) // current ±1
              ) {
                return (
                  <Button
                    key={i}
                    variant={page === i ? "default" : "outline"}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </Button>
                );
              } else if (
                (i === page - 2 && page > 2) ||
                (i === page + 2 && page < Math.ceil(total / limit) - 3)
              ) {
                return <span key={i} className="px-2">...</span>;
              }
              return null;
            })}

            {/* Next Button */}
            <Button
              variant="outline"
              disabled={(page + 1) * limit >= total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>



        {/* Order Details Modal */}
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span>Order Details - {selectedOrder?.orderNumber}</span>
                <Badge className={`${getStatusBadgeColor(selectedOrder?.status || "")} px-2 py-0 h-6 text-xs text-white`}>
                  {selectedOrder && getStatusIcon(selectedOrder.status, 14)}
                  <span className="ml-1 capitalize">{selectedOrder?.status}</span>
                </Badge>
              </DialogTitle>
            </DialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer & Table Info */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Customer Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.tableNumber}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Order Timing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Ordered: {new Date(selectedOrder.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.itemNames?.map((name, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{selectedOrder.quantity?.[i]}x</span>
                            <span>{name}</span>
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                {/* Order Total */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div>
                    <p className="font-medium">Order Total</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">${Number(selectedOrder.totalPrice).toFixed(2)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
