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
  AlertTriangle,
  LoaderIcon,
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
import { HotelType, Invoice, OrderType } from "@/types";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getInvoicePDFDefinition } from "@/components/invoice/GetInvoicePDFDefinition";

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
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [hotelsData, setHotelsData] = useState<HotelType | null>(null);
  const [menuMap, setMenuMap] = useState<{ [id: string]: string }>({});
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

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
  type PaymentMethod = "cash" | "card" | "upi" | "Bank Transfer";
  type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

  // Form state for create invoice modal
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
    items: [{ name: "", quantity: 1, price: 0 }],
    notes: "",
    paymentMethod: "cash" as PaymentMethod,
    paymentStatus: "pending" as PaymentStatus,

  });

  // Form state for edit invoice modal
  const [editForm, setEditForm] = useState({
    customerName: "",
    customerPhone: "",
    tableNumber: "",
    paymentMethod: "cash" as PaymentMethod,
    paymentStatus: "pending" as PaymentStatus,
    notes: ""
  });

  // Auto-fill customer order data
  const handleCustomerPhoneChange = async (customerPhone: string) => {
    setInvoiceForm(prev => ({ ...prev, customerPhone }));
    setTableLoading(true); // start loader

    if (customerPhone.trim()) {
      try {
        // Fetch orders for this customer
        const response = await fetch(`/api/orders?customer_phone=${encodeURIComponent(customerPhone)}`);
        const data = await response.json();

        if (response.ok && data.orders && data.orders.length > 0) {
          const latestOrder = data.orders[0];

          // Fetch table details
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
        } else {
          // Clear table number if no orders
          setInvoiceForm(prev => ({ ...prev, tableNumber: "" }));
        }
      } catch (error) {
        console.error("Error fetching customer orders:", error);
      }
    } else {
      setInvoiceForm(prev => ({ ...prev, tableNumber: "" }));
    }

    setTableLoading(false);
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
        const response = await fetch(
          `/api/admin/invoices?page=${page}&limit=${limit}&searchTerm=${encodeURIComponent(
            searchTerm
          )}&status=${statusFilter}&dateFilter=${dateFilter}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
          }
        );
        const data = await response.json();

        if (response.ok) {
          setInvoices(data.invoices || []);
          setTotal(data.pagination?.total || 0);
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

  useEffect(() => {
    fetchInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, searchTerm, statusFilter, dateFilter]);

  // Create invoice from form data
  const handleCreateInvoice = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!invoiceForm.customerName || !invoiceForm.customerPhone || !invoiceForm.tableNumber || invoiceForm.items.length === 0) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Calculate totals
      const subtotal = invoiceForm.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
      const tax = subtotal * 0.18; // 18% tax
      const totalAmount = subtotal + tax;

      const payload = {
        customer_name: invoiceForm.customerName,
        customer_phone: invoiceForm.customerPhone,
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
    fetchOrders();
  }, []);


  const getHotelsData = async () => {
    try {
      const res = await fetch("/api/admin/tenant-hotel");
      if (!res.ok) {
        throw new Error("Failed to fetch hotel data");
      }
      const data = await res.json();

      if (data.hotel) {
        setHotelsData(data.hotel);

      }

      return data.hotel || null;
    } catch (error) {
      console.error("Error fetching hotel data:", error);
      return null;
    }
  };

  useEffect(() => {
    getHotelsData();
  }, []);


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
      customerPhone: "",
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

  interface PdfFonts {
    vfs: Record<string, string>;
  }

  function configurePdfMakeFonts(pdfMake: unknown, pdfFonts: PdfFonts): void {
    if (typeof pdfMake !== 'object' || pdfMake === null) {
      throw new Error('pdfMake is not a valid object');
    }

    const pdfMakeObj = pdfMake as Record<string, unknown>;

    if (typeof pdfMakeObj.default === 'object' && pdfMakeObj.default !== null) {
      const defaultObj = pdfMakeObj.default as Record<string, unknown>;
      defaultObj.vfs = pdfFonts.vfs;
    } else {
      pdfMakeObj.vfs = pdfFonts.vfs;
    }
  }

  const paymentColors: Record<string, string> = {
    cash: "#059669",
    card: "#3b82f6",
    upi: "#f59e0b",
    "Bank Transfer": "#8b5cf6"
  };

  configurePdfMakeFonts(pdfMake, pdfFonts);

  const downloadPDF = (selectedInvoice: Invoice) => {
    if (!selectedInvoice) return;
    const paymentColor = paymentColors[selectedInvoice.paymentMethod || ""] || "#4b5563";

    try {
      const docDefinition = getInvoicePDFDefinition({
        selectedInvoice,
        hotelsData: hotelsData!,
        menuMap,
        paymentColor,
        formatDate,
        getInvoiceTax
      });


      pdfMake.createPdf(docDefinition).download(`invoice-${selectedInvoice.invoiceNumber || selectedInvoice.id}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const printInvoice = () => {
    if (!selectedInvoice) return;
    const paymentColor = paymentColors[selectedInvoice.paymentMethod || ""] || "#4b5563";

    try {
      // Defensive checks for items, quantities, prices
      const items = Array.isArray(selectedInvoice.items) ? selectedInvoice.items : [];
      const quantities = Array.isArray(selectedInvoice.quantities) ? selectedInvoice.quantities : [];
      const prices = Array.isArray(selectedInvoice.prices) ? selectedInvoice.prices : [];

      // Create HTML content that matches the PDF layout
      const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${selectedInvoice.invoiceNumber || selectedInvoice.id}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: 'Helvetica', Arial, sans-serif;
            margin: 40px;
            color: #374151;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin: 0;
          }
          .invoice-number {
            font-size: 16px;
            font-weight: bold;
            color: #3b82f6;
          }
          .divider {
            border-top: 2px solid #e5e7eb;
            margin: 10px 0 20px 0;
          }
          .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .company-info {
            width: 50%;
          }
          .customer-info {
            width: 50%;
            text-align: right;
          }
          .company-name {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 5px;
          }
          .company-details {
            font-size: 10px;
            color: #6b7280;
            line-height: 1.4;
          }
          .section-label {
            font-size: 12px;
            font-weight: bold;
            color: #374151;
            margin-bottom: 5px;
          }
          .customer-name {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 2px;
          }
          .customer-details {
            font-size: 11px;
            color: #6b7280;
            line-height: 1.4;
          }
          .payment-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .payment-method {
            color: ${paymentColor};
            font-size: 12px;
          }
          .payment-status {
            font-size: 12px;
            font-weight: bold;
            color: ${selectedInvoice.paymentStatus === "paid" ? "#059669" : "#dc2626"};
          }
          .section-header {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin: 20px 0 10px 0;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          .items-table th {
            background-color: #3b82f6;
            color: #ffffff;
            font-weight: bold;
            font-size: 12px;
            padding: 8px 6px;
            text-align: left;
          }
          .items-table td {
            font-size: 11px;
            color: #374151;
            padding: 8px 6px;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-section {
            text-align: right;
            margin: 20px 0 30px 0;
          }
          .total-row {
            margin-bottom: 5px;
          }
          .total-label {
            font-size: 12px;
            color: #6b7280;
            display: inline-block;
            width: 100px;
            text-align: right;
            margin-right: 10px;
          }
          .total-value {
            font-size: 12px;
            color: #374151;
            font-weight: bold;
            display: inline-block;
            width: 80px;
            text-align: right;
          }
          .divider-line {
            border-top: 1px solid #e5e7eb;
            margin: 10px 0;
            width: 200px;
            display: inline-block;
          }
          .grand-total-label {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            display: inline-block;
            width: 100px;
            text-align: right;
            margin-right: 10px;
          }
          .grand-total-value {
            font-size: 14px;
            font-weight: bold;
            color: #059669;
            display: inline-block;
            width: 80px;
            text-align: right;
          }
          .footer {
            text-align: center;
            background-color: #f9fafb;
            padding: 10px;
            border-radius: 5px;
            margin-top: 30px;
          }
          .thank-you {
            font-size: 14px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 5px;
          }
          .footer-contact {
            font-size: 10px;
            color: #9ca3af;
            font-style: italic;
          }
          .spacer {
            height: 20px;
          }
          
          @media print {
            body {
              margin: 0;
              padding: 20px;
            }
            .invoice-container {
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="header">
            <h1>INVOICE</h1>
            <div class="invoice-number">#${selectedInvoice.invoiceNumber || selectedInvoice.id}</div>
          </div>
          
          <div class="divider"></div>

          <!-- Company and Customer Info -->
          <div class="info-section">
            <div class="company-info">
              <div class="company-name">${hotelsData?.name}</div>
              <div class="company-details">
                ${hotelsData?.address}<br>
                Phone: ${hotelsData?.owner_phone}<br>
                Email: ${hotelsData?.email}
              </div>
            </div>
            <div class="customer-info">
              <div class="section-label">BILL TO: ${selectedInvoice.customerName || "Guest"}</div>
              <div class="customer-details">
              phone: ${selectedInvoice.customerPhone || "N/A"}<br>
                Table: ${selectedInvoice.tableNumber || "N/A"}<br>
                Date: ${formatDate(selectedInvoice.createdAt)}
              </div>
            </div>
          </div>

          <div class="spacer"></div>

          <!-- Payment Details -->
          <div class="payment-section">
            <div>
              <div class="section-label">Payment Method</div>
              <div class="payment-method">${selectedInvoice.paymentMethod || "N/A"}</div>
            </div>
            <div>
              <div class="section-label">Payment Status</div>
              <div class="payment-status">${selectedInvoice.paymentStatus || "N/A"}</div>
            </div>
          </div>

          <!-- Items Table -->
          <div class="section-header">ORDER ITEMS</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((itemId, idx) => `
                <tr>
                  <td>${menuMap[itemId] || itemId}</td>
                  <td>${quantities[idx] ?? ""}</td>
                  <td>$${parseFloat(prices[idx] ?? "0").toFixed(2)}</td>
                  <td>$${((parseInt(quantities[idx] ?? "0") * parseFloat(prices[idx] ?? "0")) || 0).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Totals Section -->
          <div class="totals-section">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-value">$${parseFloat(selectedInvoice.subtotal ?? "0").toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">Tax:</span>
              <span class="total-value">$${getInvoiceTax().toFixed(2)}</span>
            </div>
            <div class="divider-line"></div>
            <div class="total-row">
              <span class="grand-total-label">Grand Total:</span>
              <span class="grand-total-value">$${parseFloat(selectedInvoice.totalAmount ?? "0").toFixed(2)}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="thank-you">Thank you for dining with us!</div>
            <div class="footer-contact">
              For any inquiries, please contact: ${hotelsData?.email || "info@ketrox.com"} | ${hotelsData?.owner_phone || "(555) 123-4567"}
            </div>
          </div>
        </div>
        
        <script>
          // Automatically trigger print when content is loaded
          window.onload = function() {
            window.print();
            // Close the window after printing (with a small delay)
            setTimeout(function() {
              window.close();
            }, 10);
          };
        </script>
      </body>
      </html>
    `;

      // Create a blob from the HTML content
      const blob = new Blob([printContent], { type: 'text/html' });
      const blobUrl = URL.createObjectURL(blob);

      // Open the print window
      const printWindow = window.open(blobUrl, '_blank');

      // Clean up the URL object after the window loads
      if (printWindow) {
        printWindow.onload = function () {
          URL.revokeObjectURL(blobUrl);
        };
      }
    } catch (error) {
      console.error("Error generating print invoice:", error);
    }
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
      customerPhone: invoice.customerPhone,
      tableNumber: invoice.tableNumber,
      paymentMethod: invoice.paymentMethod as PaymentMethod,
      paymentStatus: invoice.paymentStatus as PaymentStatus,
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
          customer_phone: editForm.customerPhone,
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
              customerPhone: editForm.customerPhone,
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

    const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    invoice.customerPhone.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || invoice.paymentStatus === statusFilter;

    let matchesDate: boolean;
    const invoiceDate = new Date(invoice.createdAt);
    const now = new Date();

    switch (dateFilter) {
      case "today": {
        matchesDate =
          invoiceDate.getDate() === now.getDate() &&
          invoiceDate.getMonth() === now.getMonth() &&
          invoiceDate.getFullYear() === now.getFullYear();
        break;
      }
      case "lastWeek": {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(now.getDate() - 7);
        matchesDate = invoiceDate >= oneWeekAgo && invoiceDate <= now;
        break;
      }
      case "lastMonth": {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        matchesDate = invoiceDate >= oneMonthAgo && invoiceDate <= now;
        break;
      }
      default:
        matchesDate = true;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

    const stats = {
    totalInvoices: filteredInvoices.length,
    paidInvoices: filteredInvoices.filter(
      inv => inv.paymentStatus === "paid"
    ).length,
    totalRevenue: filteredInvoices
      .filter(inv => inv.paymentStatus === "paid")
      .reduce((sum, inv) => sum + parseFloat(inv.totalAmount), 0),
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="customer-name" className="text-foreground mb-2">
                        Customer Name
                      </Label>
                      <Input
                        id="customer-name"
                        value={invoiceForm.customerName}
                        onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer-phone" className="text-foreground mb-2">
                        Customer Phone
                      </Label>
                      <Input
                        id="customer-phone"
                        value={invoiceForm.customerPhone}

                        onChange={(e) => handleCustomerPhoneChange(e.target.value)}
                        placeholder="123-456-7890"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols gap-4">
                    <div>
                      <Label htmlFor="table-number" className="text-foreground mb-2">
                        Table Number
                      </Label>
                      <Input
                        id="table-number"
                        readOnly
                        value={tableLoading ? "Loading..." : invoiceForm.tableNumber}
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
                  <Button onClick={handleCreateInvoice} disabled={loading}>
                    {loading && <LoaderIcon className="w-4 h-4 animate-spin text-white" />}
                    {loading ? "Adding..." : "Add Invoice"}

                  </Button>
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
                <SelectItem value="lastWeek">This Week</SelectItem>
                <SelectItem value="lastMonth">This Month</SelectItem>
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

          {/* Invoices Table */}
          <div className="rounded-lg border overflow-hidden rounded-b-lg">
            <Table>
              <TableHeader className={`[&_tr]:${filteredInvoices.length === 0 ? "border-b-0" : "border-b"
                }`}>
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
                      <div className="flex items-center space-x-3">
                        {/* Initials Avatar */}
                        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                          {invoice.customerName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>

                        {/* Name and phone */}
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{invoice.customerName}</span>
                          <span className="text-xs text-muted-foreground">{invoice.customerPhone}</span>
                        </div>
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
  
       {/* Pagination Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {page * limit + 1} - {Math.min((page + 1) * limit, total)} of {total} invoices
        </p>
        <div className="flex flex-wrap gap-2 items-center justify-center">
          <Button
            variant="outline"
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(p - 1, 0))}
          >
            Prev
          </Button>

          {Array.from({ length: Math.ceil(total / limit) }, (_, i) => {
            if (
              i === 0 ||
              i === Math.ceil(total / limit) - 1 ||
              (i >= page - 1 && i <= page + 1)
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

          <Button
            variant="outline"
            disabled={(page + 1) * limit >= total}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

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
              <label htmlFor="customer-name" className="text-sm font-medium">Customer Name</label>
              <Input
                value={editForm.customerName}
                onChange={(e) => setEditForm(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Enter customer name"
              />
            </div>

            <div>
              <label htmlFor="table-number" className="text-sm font-medium">Table Number</label>
              <Input
                value={editForm.tableNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, tableNumber: e.target.value }))}
                placeholder="Enter table number"
              />
            </div>

            <div className="flex gap-2">
              <div className="flex-1">
                <label htmlFor="payment-method" className="text-sm font-medium">Payment Method</label>
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
                <label htmlFor="payment-status" className="text-sm font-medium">Payment Status</label>
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
              <label htmlFor="notes" className="text-sm font-medium">Notes</label>
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
              {loading && <LoaderIcon className="w-4 h-4 animate-spin text-white" />}
              {loading ? "Updating..." : "Update Invoice"}
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
                  <p className="text-sm text-gray-600">Phone: {selectedInvoice.customerPhone}</p>
                  <p className="text-sm text-gray-600">Table: {selectedInvoice.tableNumber}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Payment Info:</h3>
                  <p className="text-sm text-gray-600">Method: {selectedInvoice.paymentMethod}</p>
                  <p className="text-sm text-gray-600 mt-1">Status: {getStatusBadge(selectedInvoice.paymentStatus)}</p>
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
                          <TableRow key={itemId} className="border-gray-200">
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
