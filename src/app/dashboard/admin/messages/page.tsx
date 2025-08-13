"use client"

import { useState } from "react";
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

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  type: 'customer' | 'support';
}

interface Ticket {
  id: number;
  subject: string;
  sender: string;
  senderEmail: string;
  hotel: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  messages: Message[];
}

// Dummy message data
const tickets: Ticket[] = [
  {
    id: 1,
    subject: "Payment processing issue",
    sender: "You",
    senderEmail: "your-email@example.com",
    hotel: "Grand Plaza Hotel",
    priority: "high",
    status: "open",
    lastMessage: "The payment gateway is not working for our bookings...",
    timestamp: "2024-01-15 14:30",
    unread: true,
    messages: [
      {
        id: 1,
        sender: "You",
        content: "Hi, we're experiencing issues with our payment gateway. Customers can't complete their bookings.",
        timestamp: "2024-01-15 14:30",
        type: "customer"
      },
      {
        id: 2,
        sender: "Support Team",
        content: "Hi there! Thank you for reaching out. I'm looking into this issue right away. Can you please provide more details about the error message customers are seeing?",
        timestamp: "2024-01-15 14:45",
        type: "support"
      },
      {
        id: 3,
        sender: "You",
        content: "They see 'Payment failed - please try again' but it happens with all payment methods.",
        timestamp: "2024-01-15 15:00",
        type: "customer"
      }
    ]
  },
  {
    id: 2,
    subject: "Need help with room management setup",
    sender: "You",
    senderEmail: "your-email@example.com",
    hotel: "Ocean View Resort",
    priority: "medium",
    status: "resolved",
    lastMessage: "Perfect, thank you for the detailed documentation!",
    timestamp: "2024-01-15 10:20",
    unread: false,
    messages: [
      {
        id: 1,
        sender: "You",
        content: "Hi, I need assistance setting up room types and seasonal rates for our resort. The interface is a bit confusing.",
        timestamp: "2024-01-15 10:20",
        type: "customer"
      },
      {
        id: 2,
        sender: "Support Team",
        content: "Hello! I'd be happy to help you set up your room management. Let me schedule a quick call to walk you through the process.",
        timestamp: "2024-01-15 10:35",
        type: "support"
      },
      {
        id: 3,
        sender: "You",
        content: "Perfect, thank you for the detailed documentation!",
        timestamp: "2024-01-15 11:15",
        type: "customer"
      }
    ]
  },
  {
    id: 3,
    subject: "API documentation request",
    sender: "You",
    senderEmail: "your-email@example.com",
    hotel: "City Center Inn",
    priority: "low",
    status: "in_progress",
    lastMessage: "I'm waiting for the documentation you mentioned...",
    timestamp: "2024-01-14 16:45",
    unread: true,
    messages: [
      {
        id: 1,
        sender: "You",
        content: "I need access to API documentation for integrating our existing POS system.",
        timestamp: "2024-01-14 15:30",
        type: "customer"
      },
      {
        id: 2,
        sender: "Support Team",
        content: "Hi! I've sent you the complete API documentation to your email. Please let me know if you need any clarification.",
        timestamp: "2024-01-14 16:00",
        type: "support"
      },
      {
        id: 3,
        sender: "You",
        content: "I'm waiting for the documentation you mentioned...",
        timestamp: "2024-01-14 16:45",
        type: "customer"
      }
    ]
  }
];

export default function UserMessages() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket>(tickets[0]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [newMessage, setNewMessage] = useState<string>("");
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    subject: "",
    hotel: "",
    priority: "medium" as "high" | "medium" | "low",
    message: ""
  });

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.hotel.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityColor = (priority: Ticket['priority'] | 'default') => {
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

  const getStatusColor = (status: Ticket['status'] | 'default') => {
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

  const getStatusIcon = (status: Ticket['status'] | 'default') => {
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

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("Sending message:", newMessage);
      setNewMessage("");
      // Here you would typically send the message to the backend
    }
  };

  const handleCreateTicket = () => {
    console.log("Creating ticket:", newTicketForm);
    setShowNewTicketDialog(false);
    setNewTicketForm({
      subject: "",
      hotel: "",
      priority: "medium",
      message: ""
    });
  };

//   const stats = {
//     open: tickets.filter(t => t.status === "open").length,
//     inProgress: tickets.filter(t => t.status === "in_progress").length,
//     resolved: tickets.filter(t => t.status === "resolved").length,
//     unread: tickets.filter(t => t.unread).length,
//   };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Stats Cards */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div> */}

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
                        onChange={(e) => setNewTicketForm({...newTicketForm, subject: e.target.value})}
                        className="col-span-3"
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="hotel" className="text-right">
                        Hotel
                      </Label>
                      <Input
                        id="hotel"
                        value={newTicketForm.hotel}
                        onChange={(e) => setNewTicketForm({...newTicketForm, hotel: e.target.value})}
                        className="col-span-3"
                        placeholder="Your hotel name"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="priority" className="text-right">
                        Priority
                      </Label>
                      <Select value={newTicketForm.priority} onValueChange={(value) => setNewTicketForm({...newTicketForm, priority: value as "high" | "medium" | "low"})}>
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
                        onChange={(e) => setNewTicketForm({...newTicketForm, message: e.target.value})}
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
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTicket.id === ticket.id 
                      ? "border-primary/50 bg-primary/5"
                      : "border-input hover:bg-accent"
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {ticket.sender.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-sm">{ticket.subject}</span>
                      {ticket.unread && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{ticket.timestamp.split(' ')[1]}</span>
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
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedTicket.sender.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedTicket.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedTicket.hotel} • {selectedTicket.timestamp.split(' ')[0]}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className={getStatusColor(selectedTicket.status)}>
                  {getStatusIcon(selectedTicket.status)}
                  <span className="ml-1 capitalize">{selectedTicket.status.replace('_', ' ')}</span>
                </Badge>
                <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                  <Flag className="w-3 h-3 mr-1" />
                  {selectedTicket.priority}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Messages */}
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {selectedTicket.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'customer' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'customer'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">{message.sender}</span>
                      <span className="text-xs opacity-75">{message.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="flex items-end space-x-2">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
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