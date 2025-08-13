"use client";

import { useState, useRef } from "react";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  FileText,
  Download,
  Printer,
  Send,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

// Realistic invoice data
const invoicesData = [
  {
    id: "INV-2024-001",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.johnson@email.com",
    tableNumber: "T001",
    date: "2024-01-15",
    dueDate: "2024-01-30",
    status: "paid",
    items: [
      { name: "Truffle Burrata", quantity: 2, price: 18.00 },
      { name: "Dry-Aged Ribeye", quantity: 1, price: 65.00 },
      { name: "Chocolate Soufflé", quantity: 2, price: 16.00 },
      { name: "Châteauneuf-du-Pape 2018", quantity: 1, price: 85.00 }
    ],
    subtotal: 200.00,
    tax: 18.00,
    tip: 36.00,
    total: 254.00,
    paymentMethod: "Credit Card",
    paymentStatus: "completed",
    notes: "Anniversary dinner - complimentary dessert included"
  },
  {
    id: "INV-2024-002",
    customerName: "Michael Chen",
    customerEmail: "m.chen@company.com",
    tableNumber: "T002",
    date: "2024-01-15",
    dueDate: "2024-01-30",
    status: "pending",
    items: [
      { name: "Seared Scallops", quantity: 1, price: 24.00 },
      { name: "Chilean Sea Bass", quantity: 1, price: 42.00 },
      { name: "Craft Cold Brew", quantity: 2, price: 6.50 }
    ],
    subtotal: 79.00,
    tax: 7.11,
    tip: 15.80,
    total: 101.91,
    paymentMethod: "Cash",
    paymentStatus: "pending",
    notes: "Business lunch"
  },
  {
    id: "INV-2024-003",
    customerName: "Emma Wilson",
    customerEmail: "emma.wilson@email.com",
    tableNumber: "T007",
    date: "2024-01-14",
    dueDate: "2024-01-29",
    status: "overdue",
    items: [
      { name: "Wagyu Beef Carpaccio", quantity: 1, price: 32.00 },
      { name: "Lobster Risotto", quantity: 1, price: 48.00 },
      { name: "Tiramisu", quantity: 1, price: 12.00 },
      { name: "Dom Pérignon", quantity: 1, price: 280.00 }
    ],
    subtotal: 372.00,
    tax: 33.48,
    tip: 74.40,
    total: 479.88,
    paymentMethod: "Credit Card",
    paymentStatus: "failed",
    notes: "Birthday celebration - special wine selection"
  },
  {
    id: "INV-2024-004",
    customerName: "David Brown",
    customerEmail: "david.brown@email.com",
    tableNumber: "T003",
    date: "2024-01-14",
    dueDate: "2024-01-29",
    status: "draft",
    items: [
      { name: "Truffle Burrata", quantity: 1, price: 18.00 },
      { name: "Chilean Sea Bass", quantity: 1, price: 42.00 },
      { name: "Artisan Hot Chocolate", quantity: 1, price: 8.00 }
    ],
    subtotal: 68.00,
    tax: 6.12,
    tip: 13.60,
    total: 87.72,
    paymentMethod: "Credit Card",
    paymentStatus: "pending",
    notes: "Romantic dinner for two"
  },
  {
    id: "INV-2024-005",
    customerName: "Alex Murphy",
    customerEmail: "alex.murphy@email.com",
    tableNumber: "T005",
    date: "2024-01-13",
    dueDate: "2024-01-28",
    status: "paid",
    items: [
      { name: "Seared Scallops", quantity: 2, price: 24.00 },
      { name: "Dry-Aged Ribeye", quantity: 1, price: 65.00 },
      { name: "Chocolate Soufflé", quantity: 1, price: 16.00 }
    ],
    subtotal: 129.00,
    tax: 11.61,
    tip: 25.80,
    total: 166.41,
    paymentMethod: "Credit Card",
    paymentStatus: "completed",
    notes: "Regular customer - preferred seating"
  }
];

const paymentMethods = ["Credit Card", "Cash", "Bank Transfer", "Mobile Payment"];
const statusOptions = ["draft", "pending", "paid", "overdue", "cancelled"];

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<typeof invoicesData[0] | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  
  // Form state for create invoice modal
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerEmail: "",
    tableNumber: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    notes: "",
    paymentMethod: "Credit Card"
  });

  const filteredInvoices = invoicesData.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all") {
      const invoiceDate = new Date(invoice.date);
      const today = new Date();
      const diffTime = today.getTime() - invoiceDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case "today":
          matchesDate = diffDays <= 1;
          break;
        case "week":
          matchesDate = diffDays <= 7;
          break;
        case "month":
          matchesDate = diffDays <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-chart-3 text-foreground"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case "pending":
        return <Badge className="bg-chart-4 text-foreground"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case "draft":
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" />Draft</Badge>;
      case "cancelled":
        return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateInvoice = () => {
    console.log("Creating invoice:", invoiceForm);
    setShowCreateModal(false);
    resetForm();
  };

  const resetForm = () => {
    setInvoiceForm({
      customerName: "",
      customerEmail: "",
      tableNumber: "",
      items: [{ name: "", quantity: 1, price: 0 }],
      notes: "",
      paymentMethod: "Credit Card"
    });
  };

  const viewInvoice = (invoice: typeof invoicesData[0]) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const downloadPDF = async () => {
    if (!invoiceRef.current || !selectedInvoice) return;

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190;
      const pageHeight = pdf.internal.pageSize.height;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`invoice-${selectedInvoice.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const printInvoice = () => {
    if (!invoiceRef.current) return;
    const printContent = invoiceRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = printContent;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const sendInvoice = (invoice: typeof invoicesData[0]) => {
    console.log(`Sending invoice ${invoice.id} to ${invoice.customerEmail}`);
    // In a real app, this would send email
  };

  const markAsPaid = (invoiceId: string) => {
    console.log(`Marking invoice ${invoiceId} as paid`);
    // In a real app, this would update the backend
  };

  const deleteInvoice = (invoiceId: string) => {
    console.log(`Deleting invoice ${invoiceId}`);
    // In a real app, this would delete from backend
  };

  const stats = {
    totalInvoices: invoicesData.length,
    paidInvoices: invoicesData.filter(inv => inv.status === "paid").length,
    pendingInvoices: invoicesData.filter(inv => inv.status === "pending").length,
    overdueInvoices: invoicesData.filter(inv => inv.status === "overdue").length,
    totalRevenue: invoicesData.filter(inv => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0),
    pendingAmount: invoicesData.filter(inv => inv.status === "pending").reduce((sum, inv) => sum + inv.total, 0)
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <CheckCircle className="w-3 h-3 text-chart-3" />
                <span>{stats.paidInvoices} paid</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-3" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-3">${stats.totalRevenue.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground mt-1">
                From paid invoices
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
              <Clock className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">${stats.pendingAmount.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <AlertTriangle className="w-3 h-3 text-destructive" />
                <span>{stats.overdueInvoices} overdue</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">
                {Math.round((stats.paidInvoices / stats.totalInvoices) * 100)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Payment success rate
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Invoice Management</CardTitle>
                <CardDescription>Create, track, and manage customer invoices</CardDescription>
              </div>
              <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogTrigger asChild>
                  <Button className="hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                      Generate a new invoice for a customer order.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="customer-name">Customer Name</Label>
                        <Input
                          id="customer-name"
                          value={invoiceForm.customerName}
                          onChange={(e) => setInvoiceForm({...invoiceForm, customerName: e.target.value})}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-email">Customer Email</Label>
                        <Input
                          id="customer-email"
                          type="email"
                          value={invoiceForm.customerEmail}
                          onChange={(e) => setInvoiceForm({...invoiceForm, customerEmail: e.target.value})}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="table-number">Table Number</Label>
                        <Input
                          id="table-number"
                          value={invoiceForm.tableNumber}
                          onChange={(e) => setInvoiceForm({...invoiceForm, tableNumber: e.target.value})}
                          placeholder="T001"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment-method">Payment Method</Label>
                        <Select value={invoiceForm.paymentMethod} onValueChange={(value) => setInvoiceForm({...invoiceForm, paymentMethod: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method} value={method}>{method}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={invoiceForm.notes}
                        onChange={(e) => setInvoiceForm({...invoiceForm, notes: e.target.value})}
                        placeholder="Special instructions or notes..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateInvoice}>Create Invoice</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search invoices..."
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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Invoices Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{invoice.customerName}</div>
                          <div className="text-sm text-muted-foreground">{invoice.customerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{invoice.tableNumber}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">${invoice.total.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => viewInvoice(invoice)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => sendInvoice(invoice)}>
                              <Send className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            {invoice.status !== "paid" && (
                              <DropdownMenuItem onClick={() => markAsPaid(invoice.id)}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Invoice
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteInvoice(invoice.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredInvoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setDateFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Detail Modal */}
        <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>
                View and manage invoice {selectedInvoice?.id}
              </DialogDescription>
            </DialogHeader>
            
            {selectedInvoice && (
              <div ref={invoiceRef} className="space-y-6 p-6 bg-white text-black rounded-lg">
                {/* Invoice Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">INVOICE</h1>
                    <p className="text-gray-600">RestaurantOS</p>
                    <p className="text-sm text-gray-500">123 Restaurant Street, City, State 12345</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">{selectedInvoice.id}</p>
                    <p className="text-sm text-gray-600">Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">Due: {new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <Separator className="border-gray-300" />

                {/* Bill To */}
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Bill To:</h3>
                    <p className="text-gray-900">{selectedInvoice.customerName}</p>
                    <p className="text-gray-600">{selectedInvoice.customerEmail}</p>
                    <p className="text-gray-600">Table: {selectedInvoice.tableNumber}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Payment Info:</h3>
                    <p className="text-gray-600">Method: {selectedInvoice.paymentMethod}</p>
                    <p className="text-gray-600">Status: {selectedInvoice.paymentStatus}</p>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-300">
                        <TableHead className="text-gray-900">Item</TableHead>
                        <TableHead className="text-gray-900">Qty</TableHead>
                        <TableHead className="text-gray-900">Price</TableHead>
                        <TableHead className="text-gray-900 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((item, index) => (
                        <TableRow key={index} className="border-gray-200">
                          <TableCell className="text-gray-900">{item.name}</TableCell>
                          <TableCell className="text-gray-600">{item.quantity}</TableCell>
                          <TableCell className="text-gray-600">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-gray-900 text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax:</span>
                      <span>${selectedInvoice.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tip:</span>
                      <span>${selectedInvoice.tip.toFixed(2)}</span>
                    </div>
                    <Separator className="border-gray-400" />
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Total:</span>
                      <span>${selectedInvoice.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedInvoice.notes && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Notes:</h3>
                    <p className="text-gray-600">{selectedInvoice.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-300">
                  <p>Thank you for dining with us!</p>
                  <p>Contact: info@restaurant.com | (555) 123-4567</p>
                </div>
              </div>
            )}
            
            <DialogFooter className="flex gap-2">
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                Close
              </Button>
              <Button variant="outline" onClick={downloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" onClick={printInvoice}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              {selectedInvoice && (
                <Button onClick={() => sendInvoice(selectedInvoice)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
