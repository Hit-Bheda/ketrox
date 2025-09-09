"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
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
  Eye
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

import AddTableDialog from "@/components/table/add-table-modal";
import EditTableDialog from "@/components/table/edit-table-modal";
import { toast } from "sonner";
import { tableSchema } from "@/schemas";
import { NotesPopover } from "@/components/table/NotesPopover";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { QrCodeType, TableType } from "@/types";

const capacities = ["2", "3", "4", "6", "8", "more than 8"];





export default function Tables() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tableItem, setTableItem] = useState<TableType[]>([])
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [qrCode, setQrCode] = useState<QrCodeType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOpen, setViewOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [tableForm, setTableForm] = useState<{
    number: string;
    name: string;
    capacity: string;
    notes: string;
  }>({
    number: "",
    name: "",
    capacity: "2",
    notes: ""
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editTableForm, setEditTableForm] = useState<{
    id: string;
    number: string;
    name: string;
    capacity: string;
    notes: string;
  }>({
    id: "",
    number: "",
    name: "",
    capacity: "2",
    notes: ""
  });

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

  const clearForm = () => {
    setTableForm({
      number: "",
      name: "",
      capacity: "2",
      notes: ""
    });
    setErrors({});
  };

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
    }

    if (statusFilter === "all") matchesStatus = true;

    return matchesSearch && matchesStatus;
  });

  const handleAddTable = async () => {
    if (!tenantId) {
      toast.error("Tenant ID not found. Please login again.");
      return;
    }

    const result = tableSchema.safeParse({
      ...tableForm, tenantId, available: true,
      maintenance: false,
    });
    if (!result.success) {
      const fieldErrors: { [key: string]: string } = {};
      result.error.issues.forEach(err => {
        if (err.path[0]) {
          if (err.path[0] === "number") fieldErrors.tableNumber = err.message;
          if (err.path[0] === "name") fieldErrors.tableName = err.message;
          if (err.path[0] === "notes") fieldErrors.tableNotes = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});

      try {
      const res = await fetch("/api/admin/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tableForm, tenantId })
      });
      const data = await res.json();
      if (!res.ok) {
       
        toast.error(data.error || "Failed to add table");

        return;
      }

      setShowAddModal(false);
      clearForm();
      await fetchTables();
      toast.success(data.message);
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : String(err) });
      toast.error("Network error");
    }
  };

  const handleEditTable = async () => {
    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/table", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTableForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Failed to update table" });
        toast.error(data.error || "Failed to delete table");
      } else {
        setEditModalOpen(false);
        fetchTables();
        toast.success(data.message);
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : String(err) });
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleToggleTableStatus = async (table: TableType, field: "available" | "maintenance") => {
    setEditLoading(true);
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
        setErrors({ general: data.error || "Failed to update table status" });
        toast.error(data.error || "Failed to update table status");
      } else {
        fetchTables();
        toast.success(data.message || "Table status updated");
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : String(err) });
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    setEditLoading(true);
    try {
      const res = await fetch("/api/admin/table", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Failed to delete table" });
        toast.error(data.error || "Failed to delete table");
      } else {
        setEditModalOpen(false);
        fetchTables();
        toast.success(data.message || "Table deleted successfully");
      }
    } catch (err) {
      setErrors({ general: err instanceof Error ? err.message : String(err) });
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setEditLoading(false);
    }
  };


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

            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4" />
              Add Table
            </Button>
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
                          onClick={() => {
                            setEditTableForm({
                              id: String(table.id),
                              number: table.number,
                              name: table.name,
                              capacity: table.capacity,
                              notes: table.notes || ""
                            });
                            setEditModalOpen(true);
                          }}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <Edit className="w-4 h-4 mr-2 text-blue-600" />
                          Edit Details
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

                        <DropdownMenuItem
                          onClick={() => handleToggleTableStatus(table, "maintenance")}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          {table.maintenance ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                              Mark as Not in Maintenance
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 mr-2 text-amber-500" />
                              Mark as Maintenance
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={handleViewQr} className="focus:bg-accent focus:text-accent-foreground"  >
                          <Eye className="w-4 h-4 mr-2 text-green-600" />
                          View QR Code
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => handleDeleteTable(table.id.toString())}
                          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                          Remove Table
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

      <AddTableDialog
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        tableForm={{ ...tableForm, capacity: String(tableForm.capacity) }}
        setTableForm={setTableForm}
        capacities={capacities}
        handleAddTable={handleAddTable}
        errors={errors}
        setErrors={setErrors}
        clearForm={clearForm}
      />
      <EditTableDialog
        open={editModalOpen}
        setOpen={setEditModalOpen}
        tableForm={{ ...editTableForm, capacity: String(editTableForm.capacity) }}
        setTableForm={setEditTableForm}
        capacities={capacities}
        onSave={handleEditTable}
        onDelete={() => handleDeleteTable(editTableForm.id)}
        loading={editLoading}
      />
    </div>
  );
}