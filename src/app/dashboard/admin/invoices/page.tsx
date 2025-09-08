"use client";

import { useState, useRef, useEffect } from "react";
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
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle
} from "lucide-react";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { toast } from "sonner";
import { HotelType } from "@/types";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Order = {
  id: string;
  orderNumber: string;
  tableId: string;
  customerName: string;
  items: string[];
  quantity: string[];
  prices: string[];
  status: string;
  paymentStatus: string;
  subtotal: string;
  tax: string;
  totalPrice: string;
  createdAt: string;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: string[];
  quantities: string[];
  prices: string[];
  subtotal: string;
  totalAmount: string;
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  createdAt: string;
};

const statusOptions = ["all", "pending", "paid", "failed", "refunded"];

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("today");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const [hotelsData, setHotelsData] = useState<HotelType | null>(null);

  const [menuMap, setMenuMap] = useState<{ [id: string]: string }>({});

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

  // Form state for create invoice modal
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    tableNumber: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    notes: "",
    paymentMethod: "cash" as "cash" | "card" | "upi" | "Bank Transfer",
    paymentStatus: "pending" as "pending" | "paid" | "failed" | "refunded"
  });

  // Form state for edit invoice modal
  const [editForm, setEditForm] = useState({
    customerName: "",
    tableNumber: "",
    paymentMethod: "cash" as "cash" | "card" | "upi" | "Bank Transfer",
    paymentStatus: "pending" as "pending" | "paid" | "failed" | "refunded",
    notes: ""
  });

  // Auto-fill customer order data
  const handleCustomerNameChange = async (customerName: string) => {
    setInvoiceForm(prev => ({ ...prev, customerName }));

    if (customerName.trim()) {
      try {
        // Fetch orders for this customer (any recent orders)
        const response = await fetch(`/api/orders?customer_name=${encodeURIComponent(customerName)}`);
        const data = await response.json();
        console.log("data", data);

        if (response.ok && data.orders && data.orders.length > 0) {
          const latestOrder = data.orders[0]; // Get the most recent order

          // Fetch table details to get the actual table number
          let tableNumber = latestOrder.tableId;
          try {
            const tableResponse = await fetch(`/api/tables/${latestOrder.tableId}`);
            if (tableResponse.ok) {
              const tableData = await tableResponse.json();
              tableNumber = tableData.table?.number || latestOrder.tableId;
            }
          } catch {
            console.log("Could not fetch table details, using table ID");
          }

          setInvoiceForm(prev => ({
            ...prev,
            tableNumber: tableNumber,
            items: latestOrder.items.map((item: string, index: number) => ({
              name: item,
              quantity: parseInt(latestOrder.quantity[index]) || 1,
              price: parseFloat(latestOrder.prices[index]) || 0
            }))
          }));
        }
      } catch (error) {
        console.error("Error fetching customer orders:", error);
      }
    }
  };


  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (response.ok) {
        setOrders(data.orders || []);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }

  };

  // Fetch existing invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/invoices");
      const data = await response.json();
      if (response.ok) {
        setInvoices(data.invoices || []);
      } else {
        toast.error("Failed to fetch invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };


  // Create invoice from form data
  const handleCreateInvoice = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!invoiceForm.customerName || !invoiceForm.tableNumber || invoiceForm.items.length === 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Calculate totals
      const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax = subtotal * 0.18; // 18% tax
      const totalAmount = subtotal + tax;

      const payload = {
        customer_name: invoiceForm.customerName,
        table_number: invoiceForm.tableNumber,
        items: invoiceForm.items.map(item => item.name),
        quantities: invoiceForm.items.map(item => item.quantity.toString()),
        prices: invoiceForm.items.map(item => item.price.toString()),
        subtotal: subtotal.toString(),
        tax: tax.toString(),
        total_amount: totalAmount.toString(),
        payment_method: invoiceForm.paymentMethod,
        payment_status: "paid",
        notes: invoiceForm.notes
      };

      const response = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Invoice created successfully");
        setShowCreateModal(false);
        resetForm();
        fetchInvoices();
      } else {
        toast.error(data.error || "Failed to create invoice");
      }
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchOrders();
  }, []);


  const getHotelsData = async () => {
    try {
      const res = await fetch("/api/super-admin/hotels");
      if (!res.ok) {
        throw new Error("Failed to fetch hotels");
      }
      const data = await res.json();
      setHotelsData(data.hotels[0]);

      return Array.isArray(data.hotels) ? data.hotels : [];
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  };

  useEffect(() => {
    getHotelsData();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.paymentStatus === statusFilter;

    let matchesDate = true;
    const invoiceDate = new Date(invoice.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today": {
        matchesDate =
          invoiceDate.getUTCFullYear() === now.getUTCFullYear() &&
          invoiceDate.getUTCMonth() === now.getUTCMonth() &&
          invoiceDate.getUTCDate() === now.getUTCDate();
        break;
      }
      case "week": {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 6);
        weekAgo.setHours(0, 0, 0, 0);
        const invoiceDateOnly = new Date(invoiceDate);
        invoiceDateOnly.setHours(0, 0, 0, 0);
        matchesDate = invoiceDateOnly >= weekAgo && invoiceDateOnly <= now;
        break;
      }
      case "month": {
        const monthAgo = new Date(now);
        monthAgo.setDate(now.getDate() - 29);
        monthAgo.setHours(0, 0, 0, 0);
        const invoiceDateOnly = new Date(invoiceDate);
        invoiceDateOnly.setHours(0, 0, 0, 0);
        matchesDate = invoiceDateOnly >= monthAgo && invoiceDateOnly <= now;
        break;
      }
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-chart-3  text-white"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
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


  const resetForm = () => {
    setInvoiceForm({
      customerName: "",
      tableNumber: "",
      items: [{ name: "", quantity: 1, price: 0 }],
      notes: "",
      paymentMethod: "cash",
      paymentStatus: "pending"
    });
  };

  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };


  // @ts-expect-error: pdfmake types mismatch, manually assigning vfs
  if (pdfMake.default) {
    // @ts-expect-error: pdfmake types mismatch, manually assigning vfs
    pdfMake.default.vfs = pdfFonts.vfs;
  } else {
    // @ts-expect-error: pdfmake types mismatch, manually assigning vfs
    pdfMake.vfs = pdfFonts.vfs;
  }

  const downloadPDF = (selectedInvoice: Invoice) => {
    if (!selectedInvoice) return;

    try {
      // Defensive checks for items, quantities, prices
      const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
      const quantities = Array.isArray(selectedInvoice.quantities) ? selectedInvoice.quantities : [];
      const prices = Array.isArray(selectedInvoice.prices) ? selectedInvoice.prices : [];

      const itemsTable = [
        ["Item", "Qty", "Price", "Total"],
        ...items.map((itemId, idx) => [
          menuMap[itemId] || itemId,
          quantities[idx] ?? "",
          `$${parseFloat(prices[idx] ?? "0").toFixed(2)}`,
          `$${((parseInt(quantities[idx] ?? "0") * parseFloat(prices[idx] ?? "0")) || 0).toFixed(2)}`,
        ]),
      ];

      const docDefinition = {
        content: [
          { text: "Invoice", style: "header" },
          {
            text: `Invoice Number: ${selectedInvoice.invoiceNumber || selectedInvoice.id}`,
            style: "subheader",
          },
          { text: `Date: ${formatDate(selectedInvoice.createdAt)}` },
          { text: `Customer: ${selectedInvoice.customerName}` },
          { text: `Table: ${selectedInvoice.tableNumber}` },
          { text: `Payment Method: ${selectedInvoice.paymentMethod}` },
          { text: `Payment Status: ${selectedInvoice.paymentStatus}` },

          { text: "\nItems:", style: "subheader" },
          {
            table: {
              headerRows: 1,
              widths: ["*", "auto", "auto", "auto"],
              body: itemsTable,
            },
          },

          {
            text: `\nSubtotal: $${parseFloat(selectedInvoice.subtotal ?? "0").toFixed(2)}`,
            style: "total",
          },
          {
            text: `Tax: $${getInvoiceTax().toFixed(2)}`,
            style: "total",
          },
          {
            text: `Grand Total: $${parseFloat(selectedInvoice.totalAmount ?? "0").toFixed(2)}`,
            style: "total",
          },
        ],
        styles: {
          header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] as [number, number, number, number] },
          subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] as [number, number, number, number] },
          total: { fontSize: 14, bold: true, alignment: "right", margin: [0, 20, 0, 0] as [number, number, number, number] },
        },
      };

      // @ts-expect-error: pdfmake types mismatch, manually assigning vfs

      pdfMake.createPdf(docDefinition).download(`invoice-${selectedInvoice.invoiceNumber || selectedInvoice.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
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

  const markAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: invoiceId,
          payment_status: 'paid'
        }),
      });

      if (response.ok) {
        setInvoices(invoices.map(inv =>
          inv.id === invoiceId
            ? { ...inv, paymentStatus: 'paid' }
            : inv
        ));
        toast.success("Invoice marked as paid");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update invoice");
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error("Failed to update invoice");
    }
  };

  const openEditModal = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setEditForm({
      customerName: invoice.customerName,
      tableNumber: invoice.tableNumber,
      paymentMethod: invoice.paymentMethod as "cash" | "card" | "upi" | "Bank Transfer",
      paymentStatus: invoice.paymentStatus as "pending" | "paid" | "failed" | "refunded",
      notes: invoice.notes || ""
    });
    setShowEditModal(true);
  };

  const updateInvoice = async () => {
    if (!editingInvoice) return;

    setLoading(true);
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoice_id: editingInvoice.id,
          customer_name: editForm.customerName,
          table_number: editForm.tableNumber,
          payment_status: editForm.paymentStatus,
          payment_method: editForm.paymentMethod,
          notes: editForm.notes
        }),
      });

      if (response.ok) {
        setInvoices(invoices.map(inv =>
          inv.id === editingInvoice.id
            ? {
              ...inv,
              customerName: editForm.customerName,
              tableNumber: editForm.tableNumber,
              paymentStatus: editForm.paymentStatus,
              paymentMethod: editForm.paymentMethod,
              notes: editForm.notes
            }
            : inv
        ));
        setShowEditModal(false);
        setEditingInvoice(null);
        toast.success("Invoice updated successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update invoice");
      }
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast.error("Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch('/api/admin/invoices', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invoice_id: invoiceId }),
      });

      if (response.ok) {
        setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        toast.success("Invoice deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete invoice");
      }
    } catch (error) {
      console.error('Error deleting invoice:', error);
      toast.error("Failed to delete invoice");
    }
  };

  const stats = {
    totalInvoices: filteredInvoices.length,
    paidInvoices: filteredInvoices.filter(
      inv => inv.paymentStatus === "paid"
    ).length,
    totalRevenue: filteredInvoices
      .filter(inv => inv.paymentStatus === "paid")
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0),
  };
  function formatDate(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  const getInvoiceTax = () => {
    if (selectedInvoice?.orderId) {
      const orderObj = orders.find(o => o.id === selectedInvoice.orderId);
      if (orderObj) return parseFloat(orderObj.tax);
    }
    // Fallback: calculate from subtotal
    if (selectedInvoice?.subtotal) {
      return parseFloat(selectedInvoice.subtotal) * 0.18;
    }
    return 0;
  };

  return (

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
            <div className="text-2xl font-bold text-chart-3">${stats.totalRevenue.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              From paid invoices
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
              {stats.totalInvoices > 0
                ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
                : 0}%
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
            <h2 className="text-2xl font-bold">Invoices</h2>
            <Dialog open={showCreateModal} onOpenChange={(isOpen) => {
              if (!isOpen) resetForm();
              setShowCreateModal(isOpen);
            }}>
              <DialogTrigger asChild>
                <Button className="hover:scale-105 transition-transform ">
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
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols gap-4">
                    <div>
                      <Label htmlFor="customer-name" className="text-foreground mb-2">Customer Name</Label>
                      <Input
                        id="customer-name"
                        value={invoiceForm.customerName}
                        onChange={(e) => handleCustomerNameChange(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols gap-4">
                    <div>
                      <Label htmlFor="table-number" className="text-foreground mb-2">Table Number</Label>
                      <Input
                        id="table-number"
                        value={invoiceForm.tableNumber}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, tableNumber: e.target.value })}
                        placeholder="T001"
                      />
                    </div>

                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="payment-method" className="text-foreground mb-2">Payment Method</Label>
                      <Select value={invoiceForm.paymentMethod} onValueChange={(value: "cash" | "card" | "upi" | "Bank Transfer") => setInvoiceForm({ ...invoiceForm, paymentMethod: value })} >
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger >
                        <SelectContent >
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="payment-status" className="text-foreground mb-2">Payment Status</Label>
                      <Select value={invoiceForm.paymentStatus} onValueChange={(value: "pending" | "paid" | "failed" | "refunded") => setInvoiceForm({ ...invoiceForm, paymentStatus: value })}>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <div>
                    <Label htmlFor="notes" className="text-foreground mb-2">Notes</Label>
                    <Textarea
                      id="notes"
                      value={invoiceForm.notes}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                      placeholder="Special instructions or notes..."
                    />

                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    resetForm();
                    setShowCreateModal(false);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateInvoice} disabled={loading}>Create Invoice</Button>
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
                {statusOptions.slice(1).map((status) => (
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
          <div className="rounded-lg border overflow-hidden rounded-b-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.invoiceNumber} className="hover:bg-muted/50 ">

                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>

                      </div>
                    </TableCell>
                    <TableCell>{invoice.tableNumber}</TableCell>
                    <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell className="font-medium">${parseFloat(invoice.totalAmount).toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.paymentStatus)}</TableCell>
                    <TableCell>
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

                          {invoice.paymentStatus !== "paid" && (
                            <DropdownMenuItem onClick={() => markAsPaid(invoice.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEditModal(invoice)}>
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

      {/* Edit Invoice Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update invoice payment details and notes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Customer Name</label>
              <Input
                value={editForm.customerName}
                onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Table Number</label>
              <Input
                value={editForm.tableNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, tableNumber: e.target.value }))}
                placeholder="Enter table number"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm font-medium">Payment Method</label>
                <Select

                  value={editForm.paymentMethod}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      paymentMethod: value as "cash" | "card" | "upi" | "Bank Transfer",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">Payment Status</label>
                <Select
                  value={editForm.paymentStatus}
                  onValueChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      paymentStatus: value as
                        | "pending"
                        | "paid"
                        | "failed"
                        | "refunded",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={editForm.notes}
                onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={updateInvoice} disabled={loading}>
              Update Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Modal */}
      <Dialog open={showInvoiceModal} onOpenChange={setShowInvoiceModal}>
        <DialogContent className="md:max-w-[750px] max-w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="text-left sm:text-center">
            <DialogTitle className="text-lg sm:text-xl">Invoice Details</DialogTitle>
            <DialogDescription className="text-sm">
              View and manage invoice {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div ref={invoiceRef} className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-white text-black rounded-lg">
              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">INVOICE</h1>
                  <p className="text-sm sm:text-base text-gray-600">{hotelsData?.name}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{hotelsData?.address}</p>
                </div>
                <div className="sm:text-right mt-3 sm:mt-0">
                  <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedInvoice.invoiceNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Date: {formatDate(selectedInvoice.createdAt)}</p>
                </div>
              </div>

              <Separator className="border-gray-300" />

              {/* Bill To */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                    Bill To: {selectedInvoice.customerName}
                  </h3>
                  <p className="text-sm text-gray-600">Table: {selectedInvoice.tableNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Payment Info:</h3>
                  <p className="text-sm text-gray-600">Method: {selectedInvoice.paymentMethod}</p>
                  <p className="text-sm text-gray-600">Status: {getStatusBadge(selectedInvoice.paymentStatus)}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <div className="min-w-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-300">
                        <TableHead className="text-gray-900 text-xs sm:text-sm px-2 sm:px-4">Item</TableHead>
                        <TableHead className="text-gray-900 text-xs sm:text-sm px-2 sm:px-4 w-12">Qty</TableHead>
                        <TableHead className="text-gray-900 text-xs sm:text-sm px-2 sm:px-4 w-20">Price</TableHead>
                        <TableHead className="text-gray-900 text-xs sm:text-sm px-2 sm:px-4 w-20 text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice.items.map((itemId, index) => {
                        const itemName = menuMap[itemId] || itemId;
                        return (
                          <TableRow key={index} className="border-gray-200">
                            <TableCell className="text-xs sm:text-sm px-2 sm:px-4 py-1 sm:py-2 max-w-[150px] sm:max-w-none">
                              {/* Tooltip for small screens */}
                              <div className="sm:hidden">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="truncate block cursor-help">{itemName}</span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-[200px] break-words">
                                      <p className="text-sm">{itemName}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                              {/* Full text for larger screens */}
                              <div className="hidden sm:block">
                                {itemName}
                              </div>
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4 py-1 sm:py-2 text-center">
                              {selectedInvoice.quantities[index]}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-gray-600 px-2 sm:px-4 py-1 sm:py-2">
                              ${parseFloat(selectedInvoice.prices[index]).toFixed(2)}
                            </TableCell>
                            <TableCell className="text-xs sm:text-sm text-gray-900 font-medium px-2 sm:px-4 py-1 sm:py-2 text-right">
                              ${(parseInt(selectedInvoice.quantities[index]) * parseFloat(selectedInvoice.prices[index])).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full sm:w-64 space-y-1 sm:space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal:</span>
                    <span>${parseFloat(selectedInvoice.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax:</span>
                    <span>${getInvoiceTax().toFixed(2)}</span>
                  </div>

                  <Separator className="border-gray-400" />
                  <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                    <span>Total:</span>
                    <span>${parseFloat(selectedInvoice.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && selectedInvoice.notes !== "no notes" && (
                <div>
                  <span className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Notes: </span>
                  <span className="text-sm text-gray-600">{selectedInvoice.notes}</span>
                </div>
              )}

              {/* Footer */}
              <div className="text-center text-xs sm:text-sm text-gray-500 pt-3 sm:pt-4 border-t border-gray-300">
                <p>Thank you for dining with us!</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2 pt-4 sm:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="bg-red-500 text-white hover:bg-red-600 hover:text-white w-full sm:w-auto order-3 sm:order-1"
              onClick={() => setShowInvoiceModal(false)}
            >
              Close
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white disabled:bg-gray-400 w-full sm:w-auto order-2"
              onClick={() => {
                if (selectedInvoice) downloadPDF(selectedInvoice);
              }}
              disabled={!selectedInvoice}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="bg-green-500 text-white hover:bg-green-600 hover:text-white w-full sm:w-auto order-1 sm:order-3"
              onClick={printInvoice}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
}
