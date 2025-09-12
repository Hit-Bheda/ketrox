"use client"

import { useEffect, useState, useRef } from "react";
import {
  Send,
  Search,
  Paperclip,
  Flag,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Plus,
  MessageSquare
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase/client";

interface ApiTicket {
  id: string;
  subject: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt?: string;
  tenantId?: string;
  createdById?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  lastMessageSenderRole?: string;
  unread?: boolean;
}

interface ApiMessage {
  id: string;
  ticketId: string;
  content: string;
  senderRole?: string;
  createdAt?: string;
  senderId?: string;
}

export default function UserMessages() {
  const [tickets, setTickets] = useState<ApiTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ApiTicket | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    priority: "medium" as "high" | "medium" | "low",
    message: ""
  });
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
      const res = await fetch("/api/admin/messages", { cache: "no-store" });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket?.id]);

  useEffect(() => {
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
        const row = payload.new as {
          id: string;
          ticket_id: string;
          content: string;
          sender_role?: string;
          created_at?: string;
          sender_id?: string;
        };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicket?.id]);

  useEffect(() => {
    const client = supabase();
    const channel = client
      .channel('tickets_admin')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'ticket',
      }, (payload) => {
        const row = payload.new as {
          id: string;
          subject: string;
          priority: "high" | "medium" | "low";
          status: "open" | "in_progress" | "resolved";
          created_at?: string;
          tenant_id?: string;
          created_by_id?: string;
        };
        setTickets((prev) => {
          const exists = prev.some((t) => t.id === row.id);
          if (payload.eventType === 'INSERT' && !exists) {
            return [{
              id: row.id,
              subject: row.subject,
              priority: row.priority,
              status: row.status,
              createdAt: row.created_at,
              tenantId: row.tenant_id,
              createdById: row.created_by_id,
              unread: true
            }, ...prev];
          }
          if (payload.eventType === 'UPDATE') {
            return prev.map((t) => t.id === row.id ? { 
              ...t, 
              status: row.status, 
              priority: row.priority, 
              subject: row.subject, 
              createdAt: row.created_at 
            } : t);
          }
          if (payload.eventType === 'DELETE') {
            const oldRow = payload.old as { id: string };
            return prev.filter((t) => t.id !== oldRow.id);
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
          ...t,
          lastMessage: content,
          lastMessageAt: createdAtIso,
          lastMessageSenderRole: senderRole || t.lastMessageSenderRole || null,
          unread: senderRole !== 'admin' // Mark as unread if message is not from admin
        } as ApiTicket)
        : t
    )));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately for better UX

    try {
      const res = await fetch("/api/admin/messages", {
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
          senderRole: "admin",
          createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, tempMessage]);
        updateTicketPreview(selectedTicket.id, messageContent, tempMessage.createdAt!, "admin");

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

  const handleCreateTicket = async () => {
    const res = await fetch("/api/admin/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicketForm),
    });
    if (res.ok) {
      const data = await res.json();
      setTickets((prev) => [data.ticket, ...prev]);
      setSelectedTicket(data.ticket);
    }
    setShowNewTicketDialog(false);
    setNewTicketForm({ subject: "", priority: "medium", message: "" });
  };

  const stats = {
    open: tickets.filter(t => t.status === "open").length,
    inProgress: tickets.filter(t => t.status === "in_progress").length,
    resolved: tickets.filter(t => t.status === "resolved").length,
    unread: tickets.filter(t => t.unread).length,
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-destructive">{stats.unread}</p>
              </div>
              <Badge className="bg-destructive text-destructive-foreground">{stats.unread}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Support Tickets</CardTitle>
                <CardDescription>Manage your support requests</CardDescription>
              </div>
              <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    New Ticket
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Support Ticket</DialogTitle>
                    <DialogDescription>
                      Describe your issue and we&apos;ll get back to you as soon as possible.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subject" className="text-right">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        value={newTicketForm.subject}
                        onChange={(e) => setNewTicketForm({ ...newTicketForm, subject: e.target.value })}
                        className="col-span-3"
                        placeholder="Brief description of your issue"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select value={newTicketForm.priority} onValueChange={(value) => setNewTicketForm({ ...newTicketForm, priority: value as "high" | "medium" | "low" })}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="message" className="text-right">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        value={newTicketForm.message}
                        onChange={(e) => setNewTicketForm({ ...newTicketForm, message: e.target.value })}
                        className="col-span-3"
                        placeholder="Describe your issue in detail..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateTicket}>Submit Ticket</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedTicket && selectedTicket.id === ticket.id
                      ? "border-primary/50 bg-primary/5"
                      : "border-input hover:bg-accent"
                    }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {ticket.subject.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{ticket.subject}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{ticket.lastMessageAt?.split('T')[1]?.slice(0, 5) || ticket.createdAt?.split('T')[0]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{ticket.lastMessage}</p>
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

              {filteredTickets.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tickets found matching your criteria.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedTicket && (<Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedTicket.subject.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>)}
                <div>
                  <h3 className="font-semibold">{selectedTicket?.subject}</h3>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectedTicket && (
                  <>
                    <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                      {getStatusIcon(selectedTicket.status)}
                      <span className="ml-1 capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                    </Badge>
                    <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                      <Flag className="w-3 h-3 mr-1" />
                      {selectedTicket.priority}
                    </Badge>
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
                  className={`flex ${message.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderRole === 'admin'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                      }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">{message.senderRole || 'user'}</span>
                      <span className="text-xs opacity-75">
                        {message.createdAt
                          ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : '--:--'}
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
                  placeholder="Type your message..."
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