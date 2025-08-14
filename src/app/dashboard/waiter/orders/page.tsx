// app/waiter/orders/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  ChefHat, 
  AlertTriangle,
  Users,
  ArrowRight,
  Zap,
  MessageSquare,
  Phone,
  CheckCircle2,
  Timer,
  Utensils,
  Star,
  Flame,
  Filter,
  Grid,
  List
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced dummy data with detailed order items
const ordersData = [
  {
    tableId: 'T-03',
    tableName: 'Window Booth',
    tableNumber: '03',
    guests: 3,
    orderId: 'ORD-1235',
    orderTime: '2:15 PM',
    estimatedTime: '15 min',
    priority: 'normal',
    status: 'ordering',
    totalAmount: 67.50,
    notes: 'Birthday celebration - surprise dessert',
    items: [
      { id: 1, name: 'Margherita Pizza', quantity: 1, status: 'pending', notes: 'Extra cheese', price: 24.99, allergies: [], spiceLevel: 0 },
      { id: 2, name: 'Caesar Salad', quantity: 1, status: 'pending', notes: 'No croutons', price: 16.99, allergies: ['gluten'], spiceLevel: 0 },
      { id: 3, name: 'Garlic Bread', quantity: 2, status: 'pending', notes: '', price: 12.99, allergies: [], spiceLevel: 0 },
      { id: 4, name: 'Chocolate Cake', quantity: 1, status: 'pending', notes: 'Birthday candle', price: 12.53, allergies: [], spiceLevel: 0 }
    ]
  },
  {
    tableId: 'T-07',
    tableName: 'Corner Table',
    tableNumber: '07',
    guests: 2,
    orderId: 'ORD-1238',
    orderTime: '1:45 PM',
    estimatedTime: '8 min',
    priority: 'high',
    status: 'preparing',
    totalAmount: 89.50,
    notes: 'No dairy products, extra spicy',
    items: [
      { id: 5, name: 'Vegan Pasta Arrabbiata', quantity: 1, status: 'preparing', notes: 'Extra spicy, no cheese', price: 22.99, allergies: ['dairy'], spiceLevel: 3 },
      { id: 6, name: 'Buffalo Wings', quantity: 12, status: 'preparing', notes: 'Extra hot sauce on side', price: 28.99, allergies: [], spiceLevel: 4 },
      { id: 7, name: 'Coconut Water', quantity: 2, status: 'served', notes: '', price: 8.99, allergies: [], spiceLevel: 0 },
      { id: 8, name: 'Vegan Ice Cream', quantity: 2, status: 'pending', notes: 'Vanilla and chocolate', price: 16.99, allergies: ['dairy'], spiceLevel: 0 }
    ]
  },
  {
    tableId: 'T-12',
    tableName: 'Patio Premium',
    tableNumber: '12',
    guests: 5,
    orderId: 'ORD-1240',
    orderTime: '1:30 PM',
    estimatedTime: 'Ready to pay',
    priority: 'urgent',
    status: 'served',
    totalAmount: 234.75,
    notes: 'VIP business dinner - premium service',
    items: [
      { id: 9, name: 'Ribeye Steak', quantity: 2, status: 'served', notes: 'Medium rare, both', price: 89.99, allergies: [], spiceLevel: 1 },
      { id: 10, name: 'Lobster Tail', quantity: 2, status: 'served', notes: 'Extra butter', price: 65.99, allergies: ['shellfish'], spiceLevel: 0 },
      { id: 11, name: 'Truffle Risotto', quantity: 1, status: 'served', notes: 'Extra truffle shavings', price: 34.99, allergies: [], spiceLevel: 0 },
      { id: 12, name: 'Wine Pairing', quantity: 1, status: 'served', notes: 'Cabernet Sauvignon', price: 43.78, allergies: [], spiceLevel: 0 }
    ]
  },
  {
    tableId: 'T-18',
    tableName: 'Bar Counter',
    tableNumber: '18',
    guests: 2,
    orderId: 'ORD-1242',
    orderTime: '2:30 PM',
    estimatedTime: '12 min',
    priority: 'normal',
    status: 'preparing',
    totalAmount: 67.25,
    notes: 'Extra spicy, no ice in drinks',
    items: [
      { id: 13, name: 'Nashville Hot Wings', quantity: 10, status: 'preparing', notes: 'Extra spicy coating', price: 24.99, allergies: [], spiceLevel: 5 },
      { id: 14, name: 'Craft IPA', quantity: 2, status: 'served', notes: 'Room temperature', price: 16.99, allergies: [], spiceLevel: 0 },
      { id: 15, name: 'Loaded Nachos', quantity: 1, status: 'preparing', notes: 'Extra jalapeños', price: 18.99, allergies: ['dairy'], spiceLevel: 3 },
      { id: 16, name: 'Onion Rings', quantity: 1, status: 'pending', notes: 'Extra crispy', price: 6.28, allergies: [], spiceLevel: 0 }
    ]
  }
];

export default function WaiterOrders() {
  const [expandedTables, setExpandedTables] = useState<string[]>(['T-07', 'T-12']);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterStatus, setFilterStatus] = useState<string>('all');




  const toggleTable = (tableId: string) => {
    setExpandedTables(prev => 
      prev.includes(tableId) 
        ? prev.filter(id => id !== tableId)
        : [...prev, tableId]
    );
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (itemId: number, currentStatus: string) => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentStatus === 'pending') {
      updateItemStatus(itemId, 'preparing');
    } else if (isRightSwipe && currentStatus === 'preparing') {
      updateItemStatus(itemId, 'served');
    }
  };

  const updateItemStatus = (itemId: number, newStatus: string) => {
    // In a real app, this would update the backend
    console.log(`Item ${itemId} status updated to ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[var(--secondary)]';
      case 'preparing': return 'bg-[var(--primary)]';
      case 'served': return 'bg-[var(--sidebar)]';
      default: return 'bg-[var(--muted)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'preparing': return <ChefHat className="w-4 h-4" />;
      case 'served': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'preparing': return 'Preparing';
      case 'served': return 'Served';
      default: return 'Unknown';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-4 border-[var(--destructive)]';
      case 'high': return 'border-l-4 border-[var(--secondary)]';
      case 'normal': return 'border-l-4 border-[var(--primary)]';
      default: return 'border-l-4 border-[var(--border)]';
    }
  };

  const getSpiceLevel = (level: number) => {
    return Array(level).fill(0).map((_, i) => (
      <Flame key={i} className="w-3 h-3 text-[var(--destructive)]" />
    ));
  };

  const getFilteredOrders = () => {
    if (filterStatus === 'all') return ordersData;
    return ordersData.filter(order => order.status === filterStatus);
  };

  const totalOrders = ordersData.length;
  const pendingItems = ordersData.reduce((sum, order) => 
    sum + order.items.filter(item => item.status === 'pending').length, 0);
  const preparingItems = ordersData.reduce((sum, order) => 
    sum + order.items.filter(item => item.status === 'preparing').length, 0);

  const filteredOrders = getFilteredOrders();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header with Controls - Desktop Enhanced */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Orders Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage orders across your assigned tables
          </p>
        </div>
        
        {/* Desktop Controls */}
        <div className="flex items-center space-x-4">
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              <Grid className="w-4 h-4 mr-2" />
              Grid
            </Button>
          </div>
          
          <Tabs value={filterStatus} onValueChange={setFilterStatus}>
            <TabsList className="hidden lg:flex bg-[var(--muted)]">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">All</TabsTrigger>
              <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Pending</TabsTrigger>
              <TabsTrigger value="preparing" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Preparing</TabsTrigger>
              <TabsTrigger value="served" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Served</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-lg lg:text-xl font-bold text-[var(--foreground)]">{totalOrders}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Active Tables</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-lg lg:text-xl font-bold text-[var(--secondary)]">{pendingItems}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-lg lg:text-xl font-bold text-[var(--primary)]">{preparingItems}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Preparing</p>
          </CardContent>
        </Card>
        
        {/* Desktop-only additional stats */}
        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-[var(--destructive)]">2</div>
            <p className="text-xs text-[var(--muted-foreground)]">Urgent</p>
          </CardContent>
        </Card>
        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-[var(--secondary)]">16m</div>
            <p className="text-xs text-[var(--muted-foreground)]">Avg Time</p>
          </CardContent>
        </Card>
        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="text-xl font-bold text-[var(--foreground)]">$458</div>
            <p className="text-xs text-[var(--muted-foreground)]">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Tabs */}
      <div className="lg:hidden">
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList className="grid w-full grid-cols-4 bg-[var(--muted)]">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">All</TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Pending</TabsTrigger>
            <TabsTrigger value="preparing" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Preparing</TabsTrigger>
            <TabsTrigger value="served" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Served</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Swipe Instructions - Mobile Only */}
      <Card className="md:hidden bg-gradient-to-r from-[var(--secondary)]/10 to-[var(--primary)]/10 border border-[var(--secondary)]/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <ArrowRight className="w-4 h-4 text-[var(--secondary)]" />
              <span className="text-[var(--foreground)]">
                Swipe right: Start preparing
              </span>
            </div>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-[var(--foreground)]">
                Swipe left: Mark served
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Layout */}
      <div className={viewMode === 'grid' && filteredOrders.length > 1 
        ? 'lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0' 
        : 'space-y-4 lg:space-y-6'
      }>
        {filteredOrders.map((order) => {
          const isExpanded = expandedTables.includes(order.tableId);
          const completedItems = order.items.filter(item => item.status === 'served').length;
          const progressPercentage = (completedItems / order.items.length) * 100;
          
          return (
            <Card 
              key={order.tableId}
              className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl bg-[var(--card)] ${getPriorityColor(order.priority)}`}
            >
              <Collapsible open={isExpanded} onOpenChange={() => toggleTable(order.tableId)}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-[var(--accent)] transition-colors p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl ${getStatusColor(order.status)} flex items-center justify-center text-white shadow-md`}>
                          <span className="font-bold text-lg lg:text-xl">{order.tableNumber}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg lg:text-xl font-bold text-[var(--foreground)]">
                            {order.tableName}
                          </CardTitle>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center space-x-1">
                              <Users className="w-3 h-3 text-[var(--muted-foreground)]" />
                              <span className="text-xs text-[var(--muted-foreground)]">{order.guests} guests</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 text-[var(--muted-foreground)]" />
                              <span className="text-xs text-[var(--muted-foreground)]">{order.orderTime}</span>
                            </div>
                            <Badge className={`${getStatusColor(order.status)} text-white text-xs px-2 py-1 rounded-full`}>
                              {order.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        {order.priority === 'urgent' && (
                          <Badge className="bg-[var(--destructive)] text-white text-xs animate-pulse">
                            URGENT
                          </Badge>
                        )}
                        <div className="text-right">
                          <div className="text-lg lg:text-xl font-bold text-[var(--foreground)]">
                            ${order.totalAmount}
                          </div>
                          <div className="text-xs text-[var(--muted-foreground)]">
                            {completedItems}/{order.items.length} items
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-[var(--muted-foreground)]" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <Progress value={progressPercentage} className="h-2 rounded-full" />
                      <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                        <span>Progress</span>
                        <span>{Math.round(progressPercentage)}% complete</span>
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="px-4 lg:px-6 pb-4 lg:pb-6">
                    {/* Order Notes */}
                    {order.notes && (
                      <div className="bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 p-3 lg:p-4 rounded-xl mb-4">
                        <div className="flex items-start space-x-2">
                          <MessageSquare className="w-4 h-4 text-[var(--secondary)] mt-0.5" />
                          <p className="text-sm text-[var(--secondary)] font-medium">
                            {order.notes}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Order Items - Grid layout for desktop */}
                    <div className={`space-y-3 ${
                      viewMode === 'grid' && typeof window !== 'undefined' && window.innerWidth >= 1024 
                        ? 'lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0' 
                        : ''
                    }`}>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-xl border transition-all duration-200 bg-[var(--background)] border-[var(--border)] hover:shadow-md`}
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={() => handleTouchEnd(item.id, item.status)}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg ${getStatusColor(item.status)} flex items-center justify-center text-white`}>
                                {getStatusIcon(item.status)}
                              </div>
                              <div>
                                <h4 className="font-semibold text-[var(--foreground)]">
                                  {item.name}
                                </h4>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-[var(--muted-foreground)]">Qty: {item.quantity}</span>
                                  {item.spiceLevel > 0 && (
                                    <div className="flex items-center space-x-1">
                                      {getSpiceLevel(item.spiceLevel)}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${getStatusColor(item.status)} text-white text-xs px-2 py-1 rounded-full`}>
                                {getStatusText(item.status)}
                              </Badge>
                              <div className="text-sm font-bold text-[var(--primary)] mt-1">
                                ${item.price}
                              </div>
                            </div>
                          </div>
                          
                          {/* Item Details */}
                          <div className="space-y-2">
                            {item.notes && (
                              <div className="flex items-start space-x-2">
                                <Star className="w-3 h-3 text-[var(--secondary)] mt-0.5" />
                                <span className="text-xs text-[var(--muted-foreground)]">{item.notes}</span>
                              </div>
                            )}
                            
                            {item.allergies.length > 0 && (
                              <div className="flex items-start space-x-2">
                                <AlertTriangle className="w-3 h-3 text-[var(--destructive)] mt-0.5" />
                                <span className="text-xs text-[var(--destructive)]">
                                  Allergies: {item.allergies.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* Quick Action Buttons - Stacked on mobile, inline on desktop */}
                          <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2 mt-3">
                            {item.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] rounded-lg font-medium flex-1"
                                onClick={() => updateItemStatus(item.id, 'preparing')}
                              >
                                <ChefHat className="w-3 h-3 mr-1" />
                                Start Preparing
                              </Button>
                            )}
                            {item.status === 'preparing' && (
                              <Button
                                size="sm"
                                className="bg-[var(--sidebar)] hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] rounded-lg font-medium flex-1"
                                onClick={() => updateItemStatus(item.id, 'served')}
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Mark Served
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] rounded-lg flex-1 lg:flex-none lg:px-3"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              <span className="lg:hidden">Call Kitchen</span>
                              <span className="hidden lg:inline">Call</span>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Table Actions */}
                    <div className="flex flex-col lg:flex-row space-y-3 lg:space-y-0 lg:space-x-3 mt-6">
                      <Button 
                        className="flex-1 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] rounded-xl h-12 font-semibold"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Mark All Served
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)] rounded-xl h-12 lg:px-6 font-semibold"
                      >
                        <Phone className="w-4 h-4 mr-2 lg:mr-0" />
                        <span className="lg:hidden">Call Kitchen</span>
                      </Button>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-4 md:h-0"></div>
    </div>
  );
}