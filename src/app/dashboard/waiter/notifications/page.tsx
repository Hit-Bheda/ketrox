// app/waiter/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Bell,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  DollarSign,
  MessageSquare,
  Utensils,
  ChefHat,
  Phone,
  Star,
  Zap,
  Eye,
  Check,
  X,
  Filter,
  MoreVertical,
  Calendar,
  Timer,
  BellRing,
  AlertCircle,
  Search,
  Grid,
  List,
  Trash2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Enhanced notification data
const notificationsData = [
  {
    id: 'notif-001',
    type: 'order_ready',
    priority: 'urgent',
    title: 'Order Ready for Service',
    message: 'Table 12 - VIP Booth: All items prepared and ready to serve',
    tableId: 'T-12',
    tableName: 'VIP Booth',
    timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
    isRead: false,
    actionRequired: true,
    orderId: 'ORD-1240',
    amount: 234.75,
    estimatedWaitTime: '2 min'
  },
  {
    id: 'notif-002',
    type: 'customer_request',
    priority: 'high',
    title: 'Customer Service Request',
    message: 'Table 7 requesting waiter assistance - dietary questions',
    tableId: 'T-07',
    tableName: 'Corner Table',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    actionRequired: true,
    orderId: null,
    amount: null,
    requestType: 'assistance'
  },
  {
    id: 'notif-003',
    type: 'payment_request',
    priority: 'normal',
    title: 'Payment Request',
    message: 'Table 18 has requested the bill',
    tableId: 'T-18',
    tableName: 'Bar Counter',
    timestamp: new Date(Date.now() - 8 * 60 * 1000), // 8 minutes ago
    isRead: false,
    actionRequired: true,
    orderId: 'ORD-1242',
    amount: 67.25,
    paymentMethod: 'card'
  },
  {
    id: 'notif-004',
    type: 'kitchen_alert',
    priority: 'high',
    title: 'Kitchen Alert',
    message: 'Table 3 order delayed - estimated additional 10 minutes',
    tableId: 'T-03',
    tableName: 'Window Booth',
    timestamp: new Date(Date.now() - 12 * 60 * 1000), // 12 minutes ago
    isRead: true,
    actionRequired: false,
    orderId: 'ORD-1235',
    amount: null,
    delayReason: 'Special preparation required'
  },
  {
    id: 'notif-005',
    type: 'new_order',
    priority: 'normal',
    title: 'New Order Placed',
    message: 'Table 21 has placed a new order',
    tableId: 'T-21',
    tableName: 'VIP Booth Premium',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    isRead: true,
    actionRequired: false,
    orderId: 'ORD-1244',
    amount: 156.80,
    itemCount: 6
  },
  {
    id: 'notif-006',
    type: 'manager_message',
    priority: 'normal',
    title: 'Manager Message',
    message: 'Great job on customer service today! VIP guest in Table 12 left excellent feedback.',
    tableId: null,
    tableName: null,
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    isRead: true,
    actionRequired: false,
    orderId: null,
    amount: null,
    from: 'Manager - Sarah Chen'
  },
  {
    id: 'notif-007',
    type: 'break_reminder',
    priority: 'low',
    title: 'Break Reminder',
    message: 'You\'ve been working for 3 hours. Consider taking a 15-minute break.',
    tableId: null,
    tableName: null,
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: true,
    actionRequired: false,
    orderId: null,
    amount: null,
    breakDuration: '15 min'
  },
  {
    id: 'notif-008',
    type: 'special_request',
    priority: 'high',
    title: 'Special Dietary Request',
    message: 'Table 15 - severe nut allergy, please ensure kitchen is aware',
    tableId: 'T-15',
    tableName: 'Garden View',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
    isRead: true,
    actionRequired: false,
    orderId: 'ORD-1246',
    amount: null,
    allergyType: 'nuts'
  }
];

export default function WaiterNotifications() {
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');


  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_ready': return <ChefHat className="w-5 h-5" />;
      case 'customer_request': return <Users className="w-5 h-5" />;
      case 'payment_request': return <DollarSign className="w-5 h-5" />;
      case 'kitchen_alert': return <AlertTriangle className="w-5 h-5" />;
      case 'new_order': return <Utensils className="w-5 h-5" />;
      case 'manager_message': return <MessageSquare className="w-5 h-5" />;
      case 'break_reminder': return <Clock className="w-5 h-5" />;
      case 'special_request': return <Star className="w-5 h-5" />;
      default: return <Bell className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return {
        bg: 'bg-[var(--destructive)]',
        border: 'border-[var(--destructive)]',
        text: 'text-[var(--destructive)]',
        bgLight: 'bg-[var(--destructive)]/10'
      };
      case 'high': return {
        bg: 'bg-[var(--secondary)]',
        border: 'border-[var(--secondary)]',
        text: 'text-[var(--secondary)]',
        bgLight: 'bg-[var(--secondary)]/10'
      };
      case 'normal': return {
        bg: 'bg-[var(--primary)]',
        border: 'border-[var(--primary)]',
        text: 'text-[var(--primary)]',
        bgLight: 'bg-[var(--primary)]/10'
      };
      case 'low': return {
        bg: 'bg-[var(--muted)]',
        border: 'border-[var(--muted)]',
        text: 'text-[var(--muted-foreground)]',
        bgLight: 'bg-[var(--muted)]/10'
      };
      default: return {
        bg: 'bg-[var(--muted)]',
        border: 'border-[var(--muted)]',
        text: 'text-[var(--muted-foreground)]',
        bgLight: 'bg-[var(--muted)]/10'
      };
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (activeTab) {
      case 'unread': 
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'urgent': 
        filtered = filtered.filter(n => n.priority === 'urgent' || n.priority === 'high');
        break;
      case 'action': 
        filtered = filtered.filter(n => n.actionRequired);
        break;
    }
    
    if (searchTerm) {
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (n.tableName && n.tableName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' || n.priority === 'high').length;
  const actionCount = notifications.filter(n => n.actionRequired).length;
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Notifications
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Stay updated with real-time alerts and messages
          </p>
        </div>
        
        {/* Desktop Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
              />
            </div>
            
            <div className="hidden lg:flex items-center space-x-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="rounded-xl border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            disabled={unreadCount === 0}
          >
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Quick Stats Cards - Responsive Grid */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[var(--destructive)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <BellRing className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--destructive)]" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-[var(--destructive)]">{unreadCount}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Unread</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--secondary)]" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-[var(--secondary)]">{urgentCount}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Priority</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-[var(--primary)]" />
            </div>
            <div className="text-lg lg:text-xl font-bold text-[var(--primary)]">{actionCount}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Action Needed</p>
          </CardContent>
        </Card>

        {/* Desktop-only additional stats */}
        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Bell className="w-5 h-5 text-[var(--secondary)]" />
            </div>
            <div className="text-xl font-bold text-[var(--secondary)]">{notifications.length}</div>
            <p className="text-xs text-[var(--muted-foreground)]">Total Today</p>
          </CardContent>
        </Card>

        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-[var(--sidebar)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Timer className="w-5 h-5 text-[var(--sidebar)]" />
            </div>
            <div className="text-xl font-bold text-[var(--sidebar)]">3m</div>
            <p className="text-xs text-[var(--muted-foreground)]">Avg Response</p>
          </CardContent>
        </Card>

        <Card className="hidden lg:block border-0 shadow-md bg-[var(--card)]">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="w-5 h-5 text-[var(--primary)]" />
            </div>
            <div className="text-xl font-bold text-[var(--primary)]">87%</div>
            <p className="text-xs text-[var(--muted-foreground)]">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[var(--muted)]">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">
            All ({notifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">
            Unread ({unreadCount})
          </TabsTrigger>
          <TabsTrigger value="urgent" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">
            Priority ({urgentCount})
          </TabsTrigger>
          <TabsTrigger value="action" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">
            Action ({actionCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className={
            viewMode === 'grid' && filteredNotifications.length > 1
              ? 'grid gap-4 lg:gap-6 md:grid-cols-2 lg:grid-cols-3'
              : 'space-y-4 lg:space-y-6'
          }>
            {filteredNotifications.length === 0 ? (
              <Card className="border-0 shadow-md bg-[var(--card)] col-span-full">
                <CardContent className="p-12 text-center">
                  <Bell className="w-12 h-12 mx-auto mb-4 text-[var(--muted-foreground)]" />
                  <h3 className="font-semibold mb-2 text-[var(--foreground)]">
                    No notifications
                  </h3>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {searchTerm ? 'No notifications match your search.' : 'You\'re all caught up! New notifications will appear here.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => {
                const priorityColors = getPriorityColor(notification.priority);
                
                return (
                  <Card 
                    key={notification.id}
                    className={`border-0 shadow-md transition-all duration-200 hover:shadow-lg bg-[var(--card)] ${
                      !notification.isRead ? `border-l-4 ${priorityColors.border}` : ''
                    } ${viewMode === 'grid' ? 'h-fit' : ''}`}
                  >
                    <CardContent className="p-4 lg:p-6">
                      <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-4' : 'items-start justify-between'}`}>
                        <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-3' : 'items-start space-x-4 flex-1'}`}>
                          {/* Icon and Content */}
                          <div className={`flex items-start space-x-3 ${viewMode === 'grid' ? 'w-full' : 'flex-1'}`}>
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center ${
                              notification.actionRequired ? priorityColors.bg : priorityColors.bgLight
                            } ${notification.actionRequired ? 'text-white' : priorityColors.text}`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className={`font-semibold text-[var(--foreground)] ${
                                  !notification.isRead ? 'font-bold' : ''
                                }`}>
                                  {notification.title}
                                </h3>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-[var(--destructive)] rounded-full"></div>
                                )}
                                <Badge 
                                  className={`${priorityColors.bg} text-white text-xs px-2 py-1 rounded-full`}
                                >
                                  {notification.priority.toUpperCase()}
                                </Badge>
                              </div>
                              
                              <p className="text-sm mb-3 text-[var(--muted-foreground)]">
                                {notification.message}
                              </p>
                              
                              {/* Metadata */}
                              <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTimeAgo(notification.timestamp)}</span>
                                </div>
                                {notification.tableId && (
                                  <div className="flex items-center space-x-1">
                                    <Utensils className="w-3 h-3" />
                                    <span>{notification.tableName}</span>
                                  </div>
                                )}
                                {notification.orderId && (
                                  <div className="flex items-center space-x-1">
                                    <span>{notification.orderId}</span>
                                  </div>
                                )}
                                {notification.amount && (
                                  <div className="flex items-center space-x-1">
                                    <DollarSign className="w-3 h-3" />
                                    <span className="font-semibold text-[var(--primary)]">
                                      ${notification.amount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className={`flex items-center space-x-2 ${viewMode === 'grid' ? 'justify-end w-full' : ''}`}>
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="h-8 w-8 p-0 hover:bg-[var(--primary)]/20"
                            >
                              <Eye className="w-4 h-4 text-[var(--primary)]" />
                            </Button>
                          )}
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-[var(--foreground)] hover:bg-[var(--accent)]"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
                              {!notification.isRead && (
                                <DropdownMenuItem 
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-[var(--foreground)] hover:bg-[var(--accent)]"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              {notification.tableId && (
                                <DropdownMenuItem className="text-[var(--foreground)] hover:bg-[var(--accent)]">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View table
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => deleteNotification(notification.id)}
                                className="text-[var(--destructive)] hover:bg-[var(--destructive)]/10"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {notification.actionRequired && (
                        <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-2' : 'flex-wrap gap-2'} mt-4 pt-4 border-t border-[var(--border)]`}>
                          {notification.type === 'order_ready' && (
                            <>
                              <Button 
                                size="sm"
                                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)] rounded-xl font-medium flex-1"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Serve Now
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] rounded-xl flex-1"
                              >
                                <Timer className="w-4 h-4 mr-2" />
                                Delay 5min
                              </Button>
                            </>
                          )}
                          {notification.type === 'customer_request' && (
                            <>
                              <Button 
                                size="sm"
                                className="bg-[var(--sidebar)] hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] rounded-xl font-medium flex-1"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                Go to Table
                              </Button>
                              <Button 
                                size="sm"
                                variant="outline"
                                className="border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-xl flex-1"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                Call Customer
                              </Button>
                            </>
                          )}
                          {notification.type === 'payment_request' && (
                            <Button 
                              size="sm"
                              className="bg-[var(--secondary)] hover:bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] rounded-xl font-medium w-full"
                            >
                              <DollarSign className="w-4 h-4 mr-2" />
                              Process Payment
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-4 md:h-0"></div>
    </div>
  );
}