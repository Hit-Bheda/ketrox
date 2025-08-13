"use client";

import { useState } from "react";
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
  Calendar
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

// Realistic order data
const ordersData = [
  {
    id: "ORD-1234",
    tableNumber: "T005",
    customerName: "Sarah Johnson",
    status: "pending",
    items: [
      { name: "Grilled Salmon", quantity: 1, price: 28.50, notes: "Medium-rare" },
      { name: "Caesar Salad", quantity: 1, price: 14.50, notes: "Extra croutons" },
      { name: "Pinot Grigio", quantity: 2, price: 12.00, notes: "Well chilled" }
    ],
    total: 67.00,
    orderTime: "7:30 PM",
    estimatedTime: "25 min",
    waitTime: "5 min",
    server: "Maria Rodriguez",
    paymentMethod: "Card",
    specialRequests: "Anniversary dinner - please add candle"
  },
  {
    id: "ORD-1235",
    tableNumber: "T012",
    customerName: "Michael Chen",
    status: "preparing",
    items: [
      { name: "Ribeye Steak", quantity: 1, price: 42.00, notes: "Medium" },
      { name: "Truffle Mashed Potatoes", quantity: 1, price: 16.00, notes: "" },
      { name: "Craft Beer", quantity: 2, price: 8.00, notes: "IPA" },
      { name: "Chocolate Dessert", quantity: 1, price: 12.00, notes: "Share plate" }
    ],
    total: 86.00,
    orderTime: "7:15 PM",
    estimatedTime: "15 min",
    waitTime: "20 min",
    server: "James Thompson",
    paymentMethod: "Cash",
    specialRequests: "Business dinner - quiet table preferred"
  },
  {
    id: "ORD-1236",
    tableNumber: "T003",
    customerName: "Emma Wilson",
    status: "ready",
    items: [
      { name: "Pasta Carbonara", quantity: 1, price: 22.50, notes: "Extra cheese" },
      { name: "Garlic Bread", quantity: 1, price: 8.50, notes: "Extra garlic" },
      { name: "House Wine", quantity: 1, price: 10.00, notes: "Red" }
    ],
    total: 41.00,
    orderTime: "7:00 PM",
    estimatedTime: "Ready",
    waitTime: "35 min",
    server: "Sarah Kim",
    paymentMethod: "Card",
    specialRequests: "Vegetarian option needed"
  },
  {
    id: "ORD-1237",
    tableNumber: "T008",
    customerName: "David Brown",
    status: "delivered",
    items: [
      { name: "Fish & Chips", quantity: 2, price: 18.75, notes: "Extra crispy" },
      { name: "Coleslaw", quantity: 2, price: 6.00, notes: "" },
      { name: "Soft Drinks", quantity: 3, price: 4.50, notes: "Coke, Sprite, Orange" }
    ],
    total: 50.75,
    orderTime: "6:45 PM",
    estimatedTime: "Completed",
    waitTime: "28 min",
    server: "David Chen",
    paymentMethod: "Card",
    specialRequests: "Kids meal - no spicy"
  },
  {
    id: "ORD-1238",
    tableNumber: "T015",
    customerName: "Priya Patel",
    status: "preparing",
    items: [
      { name: "Chicken Tikka Masala", quantity: 1, price: 24.00, notes: "Mild spice" },
      { name: "Basmati Rice", quantity: 1, price: 6.00, notes: "" },
      { name: "Naan Bread", quantity: 2, price: 5.50, notes: "Garlic naan" },
      { name: "Mango Lassi", quantity: 2, price: 7.00, notes: "Extra thick" }
    ],
    total: 49.00,
    orderTime: "7:45 PM",
    estimatedTime: "20 min",
    waitTime: "10 min",
    server: "Elena Petrov",
    paymentMethod: "Card",
    specialRequests: "Allergy: nuts - please confirm no nuts in any dish"
  },
  {
    id: "ORD-1239",
    tableNumber: "T007",
    customerName: "Alex Murphy",
    status: "pending",
    items: [
      { name: "Wagyu Burger", quantity: 1, price: 32.00, notes: "Medium-rare" },
      { name: "Sweet Potato Fries", quantity: 1, price: 9.50, notes: "Extra crispy" },
      { name: "Milkshake", quantity: 1, price: 8.50, notes: "Vanilla" }
    ],
    total: 50.00,
    orderTime: "7:50 PM",
    estimatedTime: "30 min",
    waitTime: "3 min",
    server: "Michael Johnson",
    paymentMethod: "Card",
    specialRequests: "Extra napkins please"
  }
];

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<typeof ordersData[0] | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    // Time filter logic would be more complex in a real app
    const matchesTime = timeFilter === "all" || true;
    
    return matchesSearch && matchesStatus && matchesTime;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary text-secondary-foreground";
      case "preparing":
        return "bg-primary text-primary-foreground";
      case "ready":
        return "bg-chart-3 text-foreground";
      case "delivered":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "preparing":
        return <ChefHat className="w-4 h-4" />;
      case "ready":
        return <Package className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (waitTime: string) => {
    const minutes = parseInt(waitTime);
    if (minutes > 30) return "text-destructive";
    if (minutes > 20) return "text-secondary-foreground";
    return "text-muted-foreground";
  };

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Updating order ${orderId} to ${newStatus}`);
    // In a real app, this would update the backend
  };

  const viewOrderDetails = (order: typeof ordersData[0]) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const stats = {
    total: ordersData.length,
    pending: ordersData.filter(o => o.status === "pending").length,
    preparing: ordersData.filter(o => o.status === "preparing").length,
    ready: ordersData.filter(o => o.status === "ready").length,
    delivered: ordersData.filter(o => o.status === "delivered").length,
    totalValue: ordersData.reduce((sum, order) => sum + order.total, 0),
    avgOrderValue: ordersData.reduce((sum, order) => sum + order.total, 0) / ordersData.length
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
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
              <CardTitle className="text-sm font-medium">Ready</CardTitle>
              <Package className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">{stats.ready}</div>
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
                  <SelectItem value="last30">Last 30 min</SelectItem>
                  <SelectItem value="last60">Last hour</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Orders Table */}
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-muted-foreground">Server: {order.server}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {order.customerName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{order.customerName}</p>
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{order.tableNumber}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm truncate">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground">{order.items.length} items</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusBadgeColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-28 h-8">
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
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span>{order.orderTime}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className={getPriorityColor(order.waitTime)}>
                              Wait: {order.waitTime}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ETA: {order.estimatedTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-right">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{order.paymentMethod}</p>
                        </div>
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
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'ready')}>
                              <Package className="w-4 h-4 mr-2" />
                              Mark Ready
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'delivered')}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark Delivered
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

        {/* Order Details Modal */}
        <Dialog open={showOrderDetails} onOpenChange={setShowOrderDetails}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span>Order Details - {selectedOrder?.id}</span>
                <Badge className={getStatusBadgeColor(selectedOrder?.status || "")}>
                  {selectedOrder && getStatusIcon(selectedOrder.status)}
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
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedOrder.tableNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Server: {selectedOrder.server}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Order Timing</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Ordered: {selectedOrder.orderTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>Wait Time: {selectedOrder.waitTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>ETA: {selectedOrder.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                {/* Order Items */}
                <div>
                  <h4 className="font-medium mb-3">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{item.quantity}x</span>
                            <span>{item.name}</span>
                          </div>
                          {item.notes && (
                            <p className="text-sm text-muted-foreground mt-1">Note: {item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                {/* Special Requests */}
                {selectedOrder.specialRequests && (
                  <div>
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-accent rounded-lg">
                      {selectedOrder.specialRequests}
                    </p>
                  </div>
                )}
                
                {/* Order Total */}
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                  <div>
                    <p className="font-medium">Order Total</p>
                    <p className="text-sm text-muted-foreground">Payment: {selectedOrder.paymentMethod}</p>
                  </div>
                  <p className="text-2xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
