"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Users,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  QrCode,
  Check,
  Table,
  CircleDot,
  UserCheck,
  Wrench,
  BookOpen,
  Eye,
} from "lucide-react";

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

import { toast } from "sonner";
import BookOrderModal from "@/components/order/add-order-modal";
import { betterFetch } from "@better-fetch/fetch";
import { NotesPopover } from "@/components/table/NotesPopover";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";
import { OrderType, QrCodeType, TableType } from "@/types";



export default function Tables() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tableItem, setTableItem] = useState<TableType[]>([])
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string } | null>(null);
  const [editingOrder, setEditingOrder] = useState<OrderType | null>(null);
  const [qrCode, setQrCode] = useState<QrCodeType | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  async function fetchTables() {
    try {
      const match = document.cookie.match(/(?:^|; )tenantId=([^;]*)/);
      if (match) {
        setTenantId(decodeURIComponent(match[1]));
      }
      const res = await fetch("/api/admin/table");
      const data = await res.json();
      setTableItem(
        (data.tables || []).map((table: TableType) => ({
          ...table,
          status: table.maintenance
            ? "maintenance"
            : table.available
              ? "available"
              : "occupied"
        }))
      );
    } catch (error) {
      console.error("Error fetching tables:", error);
    }
  }

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = tableItem.filter(table => {
    const matchesSearch =
      table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "available") {
      matchesStatus = table.available && !table.maintenance;
    } else if (statusFilter === "maintenance") {
      matchesStatus = table.maintenance;
    } else if (statusFilter === "occupied") {
      matchesStatus = !table.available && !table.maintenance;
    } // add more status if needed

    if (statusFilter === "all") matchesStatus = true;

    return matchesSearch && matchesStatus;
  });


  const handleToggleTableStatus = async (table: TableType, field: "available" | "maintenance") => {

    try {
      const res = await fetch("/api/admin/table", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: table.id,
          [field]: !table[field],
          // If toggling available to true, also set maintenance to false
          ...(field === "available" && !table.available ? { maintenance: false } : {}),
          // If toggling maintenance to true, also set available to false
          ...(field === "maintenance" && !table.maintenance ? { available: false } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {

        toast.error(data.error || "Failed to update table status");
      } else {
        fetchTables();
        toast.success(data.message || "Table status updated");
      }
    } catch (err) {
      console.log(err);
      toast.error("Network error");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await betterFetch<{
          user: { id: string; name: string; role: string; image?: string }
        }>("/api/auth/get-session", {
          baseURL: window.location.origin,
          credentials: "include"
        });

        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            role: session.user.role,
          });
        }
        console.log("Fetched user session:", session);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();
  }, []);


  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  }

  useEffect(() => {
    const fetchQrCode = async () => {
      const tenantId = getCookie("tenantId");
      if (!tenantId) return;

      try {
        const res = await fetch(`/api/qr?tenantId=${tenantId}`);
        const data: { success: boolean; qr?: QrCodeType; error?: string } = await res.json();
        if (res.ok && data.success && data.qr) {
          setQrCode(data.qr);

        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        toast.error(`Error fetching QR: ${message}`);
        return null;
      }
    };

    fetchQrCode();
  }, []);

  const handleViewQr = () => {
    if (!qrCode) {
      toast.error("No QR code available to view");
      return;
    }
    setViewOpen(true);
  };

  const stats = {
    total: tableItem.length,
    available: tableItem.filter(t => t.available && !t.maintenance).length,
    occupied: tableItem.filter(t => !t.available && !t.maintenance).length,
    maintenance: tableItem.filter(t => t.maintenance).length,
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Tables */}
        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Tables</CardTitle>
            <Table className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <CircleDot className="w-3 h-3 text-blue-500" />
              <span>{stats.total} total tables</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Available</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.available}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Check className="w-3 h-3 text-green-500" />
              <span>{stats.available} available</span>
            </div>
          </CardContent>
        </Card>

        {/* Occupied */}
        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Occupied</CardTitle>
            <Users className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400">{stats.occupied}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <UserCheck className="w-3 h-3 text-violet-500" />
              <span>{stats.occupied} occupied</span>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance */}
        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.maintenance}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Wrench className="w-3 h-3 text-amber-500" />
              <span>{stats.maintenance} under maintenance</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-card-foreground">Table Management</CardTitle>
              <CardDescription>Manage restaurant tables, capacity, and bookings</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              <Input
                placeholder="Search tables..."
                className="pl-9 bg-background border-input text-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background border-input text-foreground">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="occupied">Occupied</SelectItem>

                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
        
          </div>

          {/* Tables Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTables.map((table) => (
              <Card
                key={table.id}
                className="hover:shadow-lg transition-all duration-300 bg-card border-1 max-w-sm"
              >
                <CardHeader className="pb-3 relative">
                  {/* Dropdown menu - stick to top right of card header */}
                  <div className="absolute right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-popover border-border text-popover-foreground"
                      >

                        <DropdownMenuItem
                          onClick={async () => {
                            setSelectedTableId(table.id);
                            if (table.status === "occupied") {
                              try {
                                // Fetch the active order for this table (status: pending or preparing)
                                const res = await fetch(`/api/orders?tableId=${table.id}`);
                                const data = await res.json();
                                console.log("Fetched order data:", data);

                                if (res.ok && data.orders && data.orders.length > 0) {
                                  // Find the most recent active order (pending or preparing)
                                  const activeOrder = data.orders.find((order: OrderType) =>
                                    order.status === "pending" || order.status === "preparing"
                                  ) || data.orders[0];

                                  setEditingOrder(activeOrder);
                                  console.log("Setting editing order:", activeOrder);
                                } else {
                                  setEditingOrder(null);
                                  if (!res.ok) {
                                    toast.error(data.error || "Failed to fetch order data");
                                  }
                                }
                              } catch (error) {
                                console.error("Error fetching order:", error);
                                toast.error("Failed to fetch order data");
                                setEditingOrder(null);
                              }
                            } else {
                              setEditingOrder(null);
                            }
                            setOrderModalOpen(true);
                          }}
                        >
                          {table.status === "occupied" ? (
                            <>
                              <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                              Update Order
                            </>
                          ) : (
                            <>
                              <BookOpen className="mr-2 h-4 w-4 text-blue-500" />
                              Book Order
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleTableStatus(table, "available")}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          {table.available ? (
                            <>
                              <XCircle className="w-4 h-4 mr-2 text-destructive" />
                              Mark Unavailable
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Mark Available
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleViewQr} className="focus:bg-accent focus:text-accent-foreground"  >
                          <Eye className="w-4 h-4 mr-2 text-green-600" />
                          View QR Code
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* QR Skeleton Full Width */}
                  <div className="w-full mb-3 mt-8">
                    {qrCode && qrCode.qrPath ? (
                      <div className="relative flex items-center justify-center w-full h-60  rounded-lg">
                        <Image
                          src={qrCode.qrPath}
                          alt="QR Code"
                          width={200}
                          height={200}
                          style={{ objectFit: "contain" }}
                          className="w-full h-full"
                          priority
                        />
                      </div>
                    ) : (
                      <div className="relative flex items-center justify-center w-full h-60 bg-muted rounded-lg animate-pulse">
                        <QrCode className="w-12 h-12 text-muted-foreground" />
                        <button
                          type="button"
                          className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow hover:bg-primary/90 transition"
                          title="Generate QR Code"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Table Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-card-foreground">{table.number}</h3>
                      <Badge
                        variant="outline"
                        className={
                          table.status === "maintenance"
                            ? "bg-amber-500/15 text-amber-700 border border-amber-500/30"
                            : table.status === "available"
                              ? "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30"
                              : "bg-destructive/15 text-destructive border border-destructive/30"
                        }
                      >
                        {table.status === "maintenance" ? (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span className="ml-1">Maintenance</span>
                          </>
                        ) : table.status === "available" ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="ml-1">Available</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-4 h-4" />
                            <span className="ml-1">Occupied</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">{table.name}</p>
                  <NotesPopover notes={table.notes || ""} />
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {table.capacity}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

            ))}
          </div>

          {filteredTables.length === 0 && (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No tables found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4 border-border text-foreground hover:bg-accent"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="flex justify-between items-center mb-4">
            <DialogTitle className="text-base font-medium">QR Code</DialogTitle>
          </div>
          <div className="flex items-center justify-center">
            {qrCode?.qrPath && (
              <Image
                src={qrCode.qrPath}
                alt="QR Code"
                width={300}
                height={300}
                className="rounded-lg border"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>


      {selectedTableId && (
        <BookOrderModal
          open={orderModalOpen}
          setOpen={setOrderModalOpen}
          tableId={selectedTableId}
          tenantId={tenantId!}
          managerId={user?.id ?? ""}
          onOrderAdded={fetchTables}
          order={editingOrder ?? undefined}
        />
      )}
    </div>
  );
}