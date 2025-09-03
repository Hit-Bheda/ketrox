"use client"

import { useEffect, useState, useRef } from "react";
import { 
  Send, 
  Search, 
  MoreHorizontal, 
  Paperclip,
  Archive,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  User
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
import { supabase } from "@/lib/supabase/client";

interface ApiTicket {
  id: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt?: string;
  tenantId?: string;
  createdById?: string; 
}

interface ApiMessage {
  id: string;
  ticketId: string;
  content: string;
  senderRole?: string;
  createdAt?: string;
  senderId?: string;
}

export default function Messages() {
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/super-admin/messages", { cache: "no-store" });
      const data = await res.json();
      setTickets(data.tickets || []);
      if ((data.tickets || []).length > 0) setSelectedTicket(data.tickets[0]);
    };
    load();
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedTicket) return;
      const res = await fetch(`/api/ticket/${selectedTicket.id}/messages`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      } else {
        setMessages([]);
      }
    };
    loadMessages();

    // polling fallback every 3s
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  useEffect(() => {
    // subscribe to messages of selected ticket
    if (!selectedTicket) return;
    const client = supabase();
    const channel = client
      .channel(`ticket_messages_${selectedTicket.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_message',
        filter: `ticket_id=eq.${selectedTicket.id}`,
      }, (payload) => {
        const row = payload.new as any;
        setMessages((prev) => [...prev, {
          id: row.id,
          ticketId: row.ticket_id,
          content: row.content,
          senderRole: row.sender_role,
          createdAt: row.created_at,
          senderId: row.sender_id,
        }]);
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [selectedTicket?.id]);

  useEffect(() => {
    // subscribe to ticket updates for list realtime
    const client = supabase();
    const channel = client
      .channel('tickets_super_admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ticket',
      }, (payload) => {
        const row = payload.new as any;
        setTickets((prev) => {
          const exists = prev.some((t) => t.id === row.id);
          if (payload.eventType === 'INSERT' && !exists) {
            return [{ ...(row as any) }, ...prev];
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((t) => t.id === row.id ? { ...t, status: row.status, priority: row.priority, subject: row.subject, createdAt: row.created_at } : t);
          }
          if (payload.eventType === 'DELETE') {
            return prev.filter((t) => t.id !== (payload.old as any).id);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: ApiTicket['priority'] | 'default') => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getStatusColor = (status: ApiTicket['status'] | 'default') => {
    switch (status) {
      case "open":
        return "bg-primary/10 text-primary border-primary/20";
      case "in_progress":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "resolved":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getStatusIcon = (status: ApiTicket['status'] | 'default') => {
    switch (status) {
      case "open":
        return <AlertCircle className="w-4 h-4" />;
      case "in_progress":
        return <Clock className="w-4 h-4" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const updateTicketPreview = (ticketId: string, content: string, createdAtIso: string, senderRole?: string) => {
    setTickets((prev) => prev.map((t) => (
      t.id === ticketId
        ? ({
            ...(t as any),
            lastMessage: content,
            lastMessageAt: createdAtIso,
            lastMessageSenderRole: senderRole || (t as any).lastMessageSenderRole || null,
          } as any)
        : t
    )));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX
    
    try {
      const res = await fetch("/api/super-admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: selectedTicket.id, content: messageContent }),
      });
      
      if (res.ok) {
        // Add the message optimistically to the UI immediately
        const tempMessage: ApiMessage = {
          id: `temp-${Date.now()}`,
          ticketId: selectedTicket.id,
          content: messageContent,
          senderRole: "super-admin",
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);
        updateTicketPreview(selectedTicket.id, messageContent, tempMessage.createdAt!, "super-admin");
        
        // Refresh messages to get the actual message from server
        const refreshRes = await fetch(`/api/ticket/${selectedTicket.id}/messages`);
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          setMessages(data.messages || []);
          const latest = (data.messages || []).slice(-1)[0];
          if (latest) updateTicketPreview(selectedTicket.id, latest.content, latest.createdAt || tempMessage.createdAt!, latest.senderRole);
        }
      } else {
        // If sending failed, restore the message to input
        setNewMessage(messageContent);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Restore the message to input if there was an error
      setNewMessage(messageContent);
    }
  };

  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/super-admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, status: data.ticket.status } : t)));
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: data.ticket.status });
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const handlePriorityChange = async (ticketId: string, newPriority: 'low' | 'medium' | 'high') => {
    try {
      const res = await fetch('/api/super-admin/messages', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ticketId, priority: newPriority }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, priority: data.ticket.priority } : t)));
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, priority: data.ticket.priority });
    } catch (e) {
      console.error('Failed to update priority', e);
    }
  };

  const stats = {
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Tickets</p>
                <p className="text-2xl font-bold text-primary">{stats.open}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-secondary">{stats.inProgress}</p>
              </div>
              <Clock className="w-8 h-8 text-secondary" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
            <CardDescription>Manage customer support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="space-y-4 mb-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Tickets */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id 
                      ? "border-primary/50 bg-primary/5"
                      : "border-input hover:bg-accent"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {(ticket as any).tenantName?.slice(0,2)?.toUpperCase() || ticket.subject.slice(0,2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{(ticket as any).tenantName || ticket.subject}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(ticket as any).lastMessageAt?.split('T')[1]?.slice(0,5) || ticket.createdAt?.split('T')[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{(ticket as any).lastMessage}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <Badge variant="outline" className={getStatusColor(ticket.status)}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1 capitalize">{ticket.status.replace('_', ' ')}</span>
                      </Badge>
                      <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                        <Flag className="w-3 h-3 mr-1" />
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedTicket && (
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {(selectedTicket as any).tenantName?.slice(0,2)?.toUpperCase() || selectedTicket.subject.slice(0,2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <h3 className="font-semibold">{selectedTicket?.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(selectedTicket as any)?.tenantName || 'Unknown Hotel'} • Ticket #{selectedTicket?.id?.slice(0, 8)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedTicket && (
                  <>
                    <Select 
                      value={selectedTicket.status} 
                      onValueChange={(value) => handleStatusChange(selectedTicket.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, 'low')}>
                          <Flag className="w-4 h-4 mr-2" />
                          Set Priority: Low
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, 'medium')}>
                          <Flag className="w-4 h-4 mr-2" />
                          Set Priority: Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handlePriorityChange(selectedTicket.id, 'high')}>
                          <Flag className="w-4 h-4 mr-2" />
                          Set Priority: High
                        </DropdownMenuItem>
                        {/* <DropdownMenuItem>
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderRole === 'super-admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderRole === 'super-admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">{message.senderRole || 'user'}</span>
                      <span className="text-xs opacity-75">
                        {message.createdAt?.split('T')[1]?.slice(0,5)}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message Input */}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your response..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}