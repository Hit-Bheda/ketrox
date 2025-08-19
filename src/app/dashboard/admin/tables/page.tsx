"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Clock,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  QrCode,
  Download,
  Printer
} from "lucide-react";
import QRCode from "qrcode";
import { useReactToPrint } from "react-to-print";

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

// Table state (dynamic)
const initialTables = [
  {
    id: 1,
    number: "T001",
    name: "Window Side",
    capacity: 4,
    status: "available",
  },

];

const locations = ["Main Dining", "Patio", "Private Room", "Bar Area", "Outdoor", "VIP Section"];
const capacities = [2, 3, 4, 6, 8];

type Table = {
  id: number;
  number: string;
  name: string;
  capacity: number;
  available: string;
  // add other fields if needed
};

export default function Tables() {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [tableItem, setTableItem] = useState<Table[]>([])

  async function fetchTables() {
    try {
      const match = document.cookie.match(/(?:^|; )tenantId=([^;]*)/);
      if (match) {
        setTenantId(decodeURIComponent(match[1]));
      }
      const res = await fetch("/api/admin/table"); // GET all
      const data = await res.json();
      console.log("Fetched tables:", data);
      setTableItem(data.tables || []);
    } catch (error) {
      console.error("Error fetching tables:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTables();
  }, []);
  const [tables, setTables] = useState(initialTables);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for add table modal
  const [tableForm, setTableForm] = useState({
    number: "",
    name: "",
    capacity: 2,
    notes: ""
  });

  const filteredTables = tableItem.filter(table => {
    const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || table.available === statusFilter;


    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30";
      case "occupied":
        return "bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30";
      case "reserved":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30";
      case "maintenance":
        return "bg-destructive/15 text-destructive dark:text-destructive-foreground border border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />;
      case "occupied":
        return <Users className="w-4 h-4" />;
      case "reserved":
        return <Clock className="w-4 h-4" />;
      case "maintenance":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);




  const handleAddTable = async () => {
    if (!tenantId) {
      setError("Tenant ID not found. Please login again.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...tableForm, tenantId })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add table");
      } else {
        setTables(prev => [...prev, data.table]);
        setShowAddModal(false);
        setTableForm({
          number: "",
          name: "",
          capacity: 2,
          notes: ""
        });
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const changeTableStatus = (tableId: number, newStatus: string) => {
    console.log(`Changing table ${tableId} status to ${newStatus}`);
    // In a real app, this would update the backend
  };

  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === "available").length,
    occupied: tables.filter(t => t.status === "occupied").length,
    reserved: tables.filter(t => t.status === "reserved").length,
    maintenance: tables.filter(t => t.status === "maintenance").length,
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Total Tables</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.total}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>{stats.available} available</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Occupied</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.occupied}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{stats.reserved} reserved</span>
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
                <SelectItem value="reserved">Reserved</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[150px] bg-background border-input text-foreground">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-popover-foreground">
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
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


                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => changeTableStatus(table.id, "available")}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Mark Available
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => changeTableStatus(table.id, "maintenance")}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <XCircle className="w-4 h-4 mr-2 text-destructive" />
                          Maintenance
                        </DropdownMenuItem>

                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                          <QrCode className="w-4 h-4 mr-2" />
                          Edit QR Code
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete QR Code
                        </DropdownMenuItem>

                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Table
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* QR Skeleton Full Width */}
                  <div className="w-full mb-3 mt-8">
                    <div className="relative flex items-center justify-center w-full h-50 bg-muted rounded-lg animate-pulse">
                      <QrCode className="w-12 h-12 text-muted-foreground" />
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 bg-primary text-white rounded-full p-1 shadow hover:bg-primary/90 transition"
                        title="Generate QR Code"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Table Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-card-foreground">{table.number}</h3>
                      <Badge variant="outline" className={table.available ? "bg-green-500/15 text-green-700 dark:text-green-300 border border-green-500/30" : "bg-destructive/15 text-destructive border border-destructive/30"}>
                        {table.available ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span className="ml-1">Available</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            <span className="ml-1">Unavailable</span>
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-muted-foreground">{table.name}</p>
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
                  setLocationFilter("all");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>





      <AddTableDialog
        showAddModal={showAddModal}
        setShowAddModal={setShowAddModal}
        tableForm={tableForm}
        setTableForm={setTableForm}
        capacities={capacities}
        handleAddTable={handleAddTable}
      />
    </div>
  );
}