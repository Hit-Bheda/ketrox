"use client";

import { useState, useRef } from "react";
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

// Realistic table data
const tablesData = [
  {
    id: 1,
    number: "T001",
    name: "Window Side",
    capacity: 4,
    location: "Main Dining",
    status: "available",
    currentBooking: null,
    nextBooking: "8:00 PM - Sarah Johnson (4 guests)",
    revenue: 2450.75,
    bookingsToday: 3,
    averageTime: "1h 20m"
  },
  {
    id: 2,
    number: "T002", 
    name: "Corner Booth",
    capacity: 6,
    location: "Main Dining",
    status: "occupied",
    currentBooking: "7:30 PM - Michael Chen (6 guests)",
    nextBooking: "9:00 PM - Emma Wilson (4 guests)",
    revenue: 3275.50,
    bookingsToday: 4,
    averageTime: "1h 45m"
  },
  {
    id: 3,
    number: "T003",
    name: "Garden View",
    capacity: 2,
    location: "Patio",
    status: "reserved",
    currentBooking: null,
    nextBooking: "8:30 PM - David Brown (2 guests)",
    revenue: 1825.25,
    bookingsToday: 5,
    averageTime: "55m"
  },
  {
    id: 4,
    number: "T004",
    name: "Chef's Table",
    capacity: 8,
    location: "Private Room",
    status: "available",
    currentBooking: null,
    nextBooking: "Tomorrow 7:00 PM - Anniversary Dinner",
    revenue: 4125.00,
    bookingsToday: 1,
    averageTime: "2h 30m"
  },
  {
    id: 5,
    number: "T005",
    name: "Bar Counter",
    capacity: 3,
    location: "Bar Area",
    status: "occupied",
    currentBooking: "7:45 PM - Alex Murphy (2 guests)",
    nextBooking: null,
    revenue: 875.50,
    bookingsToday: 6,
    averageTime: "45m"
  },
  {
    id: 6,
    number: "T006",
    name: "Fireplace",
    capacity: 4,
    location: "Main Dining",
    status: "maintenance",
    currentBooking: null,
    nextBooking: null,
    revenue: 0,
    bookingsToday: 0,
    averageTime: "0m"
  },
  {
    id: 7,
    number: "T007",
    name: "Terrace",
    capacity: 6,
    location: "Outdoor",
    status: "available",
    currentBooking: null,
    nextBooking: "9:15 PM - Birthday Party (6 guests)",
    revenue: 2675.25,
    bookingsToday: 2,
    averageTime: "1h 15m"
  },
  {
    id: 8,
    number: "T008",
    name: "VIP Booth",
    capacity: 8,
    location: "VIP Section",
    status: "reserved",
    currentBooking: null,
    nextBooking: "8:00 PM - Business Dinner (8 guests)",
    revenue: 5250.75,
    bookingsToday: 2,
    averageTime: "2h 10m"
  }
];

const locations = ["Main Dining", "Patio", "Private Room", "Bar Area", "Outdoor", "VIP Section"];
const capacities = [2, 3, 4, 6, 8];

export default function Tables() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState<typeof tablesData[0] | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Form state for add table modal
  const [tableForm, setTableForm] = useState({
    number: "",
    name: "",
    capacity: 4,
    location: "Main Dining",
    notes: ""
  });

  // Form state for booking modal
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    guests: 2,
    date: "",
    time: "",
    notes: ""
  });

  const filteredTables = tablesData.filter(table => {
    const matchesSearch = table.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || table.status === statusFilter;
    const matchesLocation = locationFilter === "all" || table.location === locationFilter;
    
    return matchesSearch && matchesStatus && matchesLocation;
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

  const handleAddTable = () => {
    console.log("Adding table:", tableForm);
    setShowAddModal(false);
    setTableForm({
      number: "",
      name: "",
      capacity: 4,
      location: "Main Dining",
      notes: ""
    });
  };

  const handleBookTable = (table: typeof tablesData[0]) => {
    setSelectedTable(table);
    setShowBookingModal(true);
  };

  const handleCreateBooking = () => {
    console.log("Creating booking for table:", selectedTable?.number, bookingForm);
    setShowBookingModal(false);
    setBookingForm({
      customerName: "",
      guests: 2,
      date: "",
      time: "",
      notes: ""
    });
  };

  const changeTableStatus = (tableId: number, newStatus: string) => {
    console.log(`Changing table ${tableId} status to ${newStatus}`);
    // In a real app, this would update the backend
  };

  const generateQRCode = async (table: typeof tablesData[0]) => {
    try {
      // Generate QR code for table link - would be actual domain in production
      const tableURL = `https://restaurant.com/table/${table.id}`;
      const qrDataURL = await QRCode.toDataURL(tableURL, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeData(qrDataURL);
      setSelectedTable(table);
      setShowQRModal(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeData && selectedTable) {
      const link = document.createElement('a');
      link.download = `table-${selectedTable.number}-qr-code.png`;
      link.href = qrCodeData;
      link.click();
    }
  };

  const handlePrint = useReactToPrint({
     contentRef:qrCodeRef
  });

  const stats = {
    total: tablesData.length,
    available: tablesData.filter(t => t.status === "available").length,
    occupied: tablesData.filter(t => t.status === "occupied").length,
    reserved: tablesData.filter(t => t.status === "reserved").length,
    maintenance: tablesData.filter(t => t.status === "maintenance").length,
    totalRevenue: tablesData.reduce((sum, table) => sum + table.revenue, 0),
    totalBookings: tablesData.reduce((sum, table) => sum + table.bookingsToday, 0)
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

        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Today&apos;s Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">{stats.totalBookings}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total reservations today
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-card-foreground">Table Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Total from all tables
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
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Add New Table</DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Add a new table to your restaurant floor plan.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="table-number" className="text-foreground">Table Number</Label>
                      <Input
                        id="table-number"
                        value={tableForm.number}
                        onChange={(e) => setTableForm({...tableForm, number: e.target.value})}
                        placeholder="T009"
                        className="bg-background border-input text-foreground"
                      />
                    </div>
                    <div>
                      <Label htmlFor="table-name" className="text-foreground">Table Name</Label>
                      <Input
                        id="table-name"
                        value={tableForm.name}
                        onChange={(e) => setTableForm({...tableForm, name: e.target.value})}
                        placeholder="Corner Table"
                        className="bg-background border-input text-foreground"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="table-capacity" className="text-foreground">Capacity</Label>
                      <Select value={tableForm.capacity.toString()} onValueChange={(value) => setTableForm({...tableForm, capacity: parseInt(value)})}>
                        <SelectTrigger className="bg-background border-input text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          {capacities.map((capacity) => (
                            <SelectItem key={capacity} value={capacity.toString()}>{capacity} guests</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="table-location" className="text-foreground">Location</Label>
                      <Select value={tableForm.location} onValueChange={(value) => setTableForm({...tableForm, location: value})}>
                        <SelectTrigger className="bg-background border-input text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          {locations.map((location) => (
                            <SelectItem key={location} value={location}>{location}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="table-notes" className="text-foreground">Notes</Label>
                    <Textarea
                      id="table-notes"
                      value={tableForm.notes}
                      onChange={(e) => setTableForm({...tableForm, notes: e.target.value})}
                      placeholder="Special features, accessibility notes..."
                      className="bg-background border-input text-foreground"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddModal(false)} className="border-border text-foreground hover:bg-accent">
                    Cancel
                  </Button>
                  <Button onClick={handleAddTable} className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Add Table
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
                className="hover:shadow-lg transition-all duration-300 bg-card border-1 "
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-card-foreground">{table.number}</h3>
                      <Badge variant="outline" className={getStatusBadgeColor(table.status)}>
                        {getStatusIcon(table.status)}
                        <span className="ml-1 capitalize">{table.status}</span>
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                        <DropdownMenuItem 
                          onClick={() => handleBookTable(table)}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Table
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => generateQRCode(table)}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <QrCode className="w-4 h-4 mr-2" />
                          Generate QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-accent focus:text-accent-foreground">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => changeTableStatus(table.id, 'available')}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                          Mark Available
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => changeTableStatus(table.id, 'maintenance')}
                          className="focus:bg-accent focus:text-accent-foreground"
                        >
                          <XCircle className="w-4 h-4 mr-2 text-destructive" />
                          Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove Table
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{table.name}</p>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Capacity: {table.capacity}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{table.location}</span>
                    </div>
                  </div>
                  
                  {table.currentBooking && (
                    <div className="p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300">Current Booking:</p>
                      <p className="text-xs text-muted-foreground">{table.currentBooking}</p>
                    </div>
                  )}
                  
                  {table.nextBooking && (
                    <div className="p-2 bg-amber-500/10 rounded-md border border-amber-500/20">
                      <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Next Booking:</p>
                      <p className="text-xs text-muted-foreground">{table.nextBooking}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="font-medium text-card-foreground">${table.revenue.toLocaleString()}</p>
                      <p className="text-muted-foreground">Revenue</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{table.bookingsToday}</p>
                      <p className="text-muted-foreground">Bookings</p>
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{table.averageTime}</p>
                      <p className="text-muted-foreground">Avg Time</p>
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

      {/* Booking Modal */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="sm:max-w-[500px] bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">Book Table {selectedTable?.number}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new reservation for {selectedTable?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer-name" className="text-foreground">Customer Name</Label>
                <Input
                  id="customer-name"
                  value={bookingForm.customerName}
                  onChange={(e) => setBookingForm({...bookingForm, customerName: e.target.value})}
                  placeholder="John Doe"
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="guests" className="text-foreground">Number of Guests</Label>
                <Select value={bookingForm.guests.toString()} onValueChange={(value) => setBookingForm({...bookingForm, guests: parseInt(value)})}>
                  <SelectTrigger className="bg-background border-input text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {Array.from({length: selectedTable?.capacity || 8}, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'guest' : 'guests'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="booking-date" className="text-foreground">Date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="booking-time" className="text-foreground">Time</Label>
                <Input
                  id="booking-time"
                  type="time"
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                  className="bg-background border-input text-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="booking-notes" className="text-foreground">Special Requests</Label>
              <Textarea
                id="booking-notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Dietary restrictions, special occasion, etc..."
                className="bg-background border-input text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBookingModal(false)}
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateBooking}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Create Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-[400px] bg-background text-foreground">
          <DialogHeader>
            <DialogTitle className="text-foreground">QR Code for {selectedTable?.number}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Scan this QR code to access the table menu and ordering system
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            <div ref={qrCodeRef} className="text-center space-y-4 bg-white p-6 rounded-lg border border-gray-200">
              <div className="text-black">
                <h3 className="text-lg font-bold">{selectedTable?.name}</h3>
                <p className="text-sm text-gray-600">Table {selectedTable?.number}</p>
                <p className="text-xs text-gray-500">Capacity: {selectedTable?.capacity} guests</p>
              </div>

              {qrCodeData && (
                <div className="flex justify-center">
                  <img
                    src={qrCodeData}
                    alt={`QR Code for Table ${selectedTable?.number}`}
                    className="border-2 border-gray-200 rounded-lg"
                  />
                </div>
              )}

              <div className="text-black">
                <p className="text-xs text-gray-500">
                  Scan to view menu and place orders
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  restaurant.com/table/{selectedTable?.id}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowQRModal(false)}
              className="border-border text-foreground hover:bg-accent"
            >
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={downloadQRCode}
              className="border-border text-foreground hover:bg-accent"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
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