// app/waiter/qr/page.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  QrCode,
  Download,
  Share,
  X,
  Maximize,
  Users,
  MapPin,
  Wifi,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  Grid,
  List,
  Search,
  Filter
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Enhanced dummy data for QR codes
const qrData = [
  {
    tableId: 'T-03',
    tableName: 'Window Booth',
    tableNumber: '03',
    capacity: 4,
    location: 'Main Floor - Window Side',
    qrCodeUrl: 'https://restaurant.menu/table/03  ',
    status: 'active',
    lastScanned: '5 min ago',
    scanCount: 23,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter'],
    section: 'main'
  },
  {
    tableId: 'T-07',
    tableName: 'Corner Table',
    tableNumber: '07',
    capacity: 2,
    location: 'Main Floor - Quiet Corner',
    qrCodeUrl: 'https://restaurant.menu/table/07  ',
    status: 'active',
    lastScanned: '2 min ago',
    scanCount: 18,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter'],
    section: 'main'
  },
  {
    tableId: 'T-12',
    tableName: 'Patio Premium',
    tableNumber: '12',
    capacity: 6,
    location: 'Outdoor Patio - Premium Section',
    qrCodeUrl: 'https://restaurant.menu/table/12  ',
    status: 'active',
    lastScanned: 'Just now',
    scanCount: 34,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter', 'VIP Service'],
    section: 'patio'
  },
  {
    tableId: 'T-15',
    tableName: 'Garden View',
    tableNumber: '15',
    capacity: 4,
    location: 'Main Floor - Garden Side',
    qrCodeUrl: 'https://restaurant.menu/table/15  ',
    status: 'active',
    lastScanned: '25 min ago',
    scanCount: 12,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter'],
    section: 'main'
  },
  {
    tableId: 'T-18',
    tableName: 'Bar Counter',
    tableNumber: '18',
    capacity: 3,
    location: 'Bar Area - Counter Seating',
    qrCodeUrl: 'https://restaurant.menu/table/18  ',
    status: 'active',
    lastScanned: '8 min ago',
    scanCount: 45,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter', 'Bar Specials'],
    section: 'bar'
  },
  {
    tableId: 'T-21',
    tableName: 'VIP Booth',
    tableNumber: '21',
    capacity: 8,
    location: 'VIP Section - Private Booth',
    qrCodeUrl: 'https://restaurant.menu/table/21  ',
    status: 'active',
    lastScanned: '15 min ago',
    scanCount: 28,
    features: ['Menu', 'Order', 'Pay', 'Call Waiter', 'VIP Service', 'Private Menu'],
    section: 'vip'
  }
];

export default function WaiterQR() {
  const [fullScreenQR, setFullScreenQR] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<{
    tableId: string;
    tableName: string;
    tableNumber: string;
    capacity: number;
    location: string;
    qrCodeUrl: string;
    status: string;
    lastScanned: string;
    scanCount: number;
    features: string[];
    section: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterSection, setFilterSection] = useState<string>('all');





  const generateQRCode = (url: string, size: number = 200) => {
    // In a real app, you'd use a QR code library like 'qrcode'
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&bgcolor=FFFFFF&color=1A1F36&margin=10`;
  };

  const copyToClipboard = async (url: string, tableId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(tableId);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const downloadQR = (url: string, tableName: string) => {
    const qrImageUrl = generateQRCode(url, 400);
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `QR-${tableName.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareQR = async (url: string, tableName: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code for ${tableName}`,
          text: `Scan this QR code to access the menu for ${tableName}`,
          url: url,
        });
      } catch (err) {
        console.error('Error sharing: ', err);
      }
    } else {
      copyToClipboard(url, tableName);
    }
  };

  const getFilteredTables = () => {
    let filtered = qrData;
    
    if (filterSection !== 'all') {
      filtered = filtered.filter(table => table.section === filterSection);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(table => 
        table.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.tableNumber.includes(searchTerm) ||
        table.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  };

  const totalScans = qrData.reduce((sum, table) => sum + table.scanCount, 0);
  const activeTables = qrData.filter(table => table.status === 'active').length;
  const filteredTables = getFilteredTables();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            QR Code Management
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Manage digital menu access for all your tables
          </p>
        </div>
        
        {/* Desktop Controls */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-3 lg:space-y-0 lg:space-x-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <Input
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)]"
              />
            </div>
            
            <Tabs value={filterSection} onValueChange={setFilterSection}>
              <TabsList className="hidden lg:flex bg-[var(--muted)]">
                <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">All</TabsTrigger>
                <TabsTrigger value="main" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Main</TabsTrigger>
                <TabsTrigger value="patio" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Patio</TabsTrigger>
                <TabsTrigger value="bar" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Bar</TabsTrigger>
                <TabsTrigger value="vip" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">VIP</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              <Grid className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-lg bg-[var(--card)] border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
            >
              <List className="w-4 h-4 mr-2" />
              <span className="hidden lg:inline">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Tabs */}
      <div className="lg:hidden">
        <Tabs value={filterSection} onValueChange={setFilterSection}>
          <TabsList className="grid w-full grid-cols-5 bg-[var(--muted)]">
            <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">All</TabsTrigger>
            <TabsTrigger value="main" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Main</TabsTrigger>
            <TabsTrigger value="patio" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Patio</TabsTrigger>
            <TabsTrigger value="bar" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">Bar</TabsTrigger>
            <TabsTrigger value="vip" className="rounded-lg data-[state=active]:bg-[var(--background)] data-[state=active]:text-[var(--foreground)]">VIP</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Quick Stats - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[var(--sidebar)] to-[var(--sidebar-accent)]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[var(--secondary)] rounded-xl mx-auto mb-3">
              <QrCode className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--secondary-foreground)]" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-white">{activeTables}</div>
            <p className="text-xs lg:text-sm text-[var(--secondary)] font-medium">Active QR Codes</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary)]">
          <CardContent className="p-4 lg:p-6 text-center">
            <div className="flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <Eye className="w-5 h-5 lg:w-6 lg:h-6 text-[var(--primary)]" />
            </div>
            <div className="text-xl lg:text-2xl font-bold text-[var(--card)]">{totalScans}</div>
            <p className="text-xs lg:text-sm text-[var(--card)]/90 font-medium">Total Scans Today</p>
          </CardContent>
        </Card>

        {/* Desktop-only additional stats */}
        <Card className="hidden lg:block border-0 shadow-lg bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)]">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <Smartphone className="w-6 h-6 text-[var(--secondary)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--secondary-foreground)]">95%</div>
            <p className="text-sm text-[var(--secondary-foreground)]/80 font-medium">Mobile Usage</p>
          </CardContent>
        </Card>

        <Card className="hidden lg:block border-0 shadow-lg bg-gradient-to-br from-[var(--destructive)] to-[var(--destructive)]">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-[var(--card)] rounded-xl mx-auto mb-3">
              <Download className="w-6 h-6 text-[var(--destructive)]" />
            </div>
            <div className="text-2xl font-bold text-[var(--card)]">47</div>
            <p className="text-sm text-[var(--card)]/90 font-medium">Downloads Today</p>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Management Info */}
      <Card className="border-0 shadow-md bg-[var(--card)]">
        <CardContent className="p-4 lg:p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[var(--secondary)]/20 rounded-xl flex items-center justify-center">
              <Wifi className="w-6 h-6 text-[var(--secondary)]" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[var(--foreground)]">
                Digital Menu System
              </h3>
              <p className="text-sm text-[var(--muted-foreground)]">
                Customers scan QR codes to access menu, place orders, and request service. 
                <span className="hidden lg:inline"> All codes are automatically updated with the latest menu and pricing.</span>
              </p>
            </div>
            <div className="hidden lg:flex items-center space-x-2 text-sm">
              <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-pulse"></div>
              <span className="text-[var(--muted-foreground)]">Live</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Codes Layout */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Table QR Codes</h2>
          <div className="text-sm text-[var(--muted-foreground)]">
            {filteredTables.length} of {qrData.length} tables
          </div>
        </div>
        
        <div className={
          viewMode === 'grid' 
            ? 'grid gap-4 lg:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'space-y-4 lg:space-y-6'
        }>
          {filteredTables.map((table) => (
            <Card 
              key={table.tableId}
              className={`border-0 shadow-lg transition-all duration-200 hover:shadow-xl bg-[var(--card)] ${viewMode === 'grid' ? 'h-fit' : ''}`}
            >
              <CardContent className={viewMode === 'grid' ? 'p-4 lg:p-6' : 'p-4 lg:p-6'}>
                <div className={`flex ${viewMode === 'grid' ? 'flex-col space-y-4' : 'items-start justify-between'} ${viewMode === 'list' ? 'lg:flex-row lg:items-center' : ''}`}>
                  <div className={`flex items-start ${viewMode === 'grid' ? 'justify-center' : 'space-x-4 flex-1'}`}>
                    <div className={`${viewMode === 'grid' ? 'w-24 h-24 lg:w-32 lg:h-32' : 'w-16 h-16 lg:w-20 lg:h-20'} bg-white rounded-xl shadow-md p-2 ${viewMode === 'grid' ? 'mb-4' : ''}`}>
                      <img 
                        src={generateQRCode(table.qrCodeUrl, viewMode === 'grid' ? 200 : 120)}
                        alt={`QR Code for ${table.tableName}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {viewMode === 'list' && (
                      <div className="flex-1">
                        <h3 className="font-bold text-lg lg:text-xl text-[var(--foreground)]">
                          Table {table.tableNumber}
                        </h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          {table.tableName}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-[var(--muted-foreground)]" />
                            <span className="text-xs text-[var(--muted-foreground)]">Up to {table.capacity}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3 text-[var(--muted-foreground)]" />
                            <span className="text-xs text-[var(--muted-foreground)]">{table.location}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {viewMode === 'grid' && (
                    <div className="text-center">
                      <h3 className="font-bold text-lg text-[var(--foreground)]">
                        Table {table.tableNumber}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {table.tableName}
                      </p>
                      <div className="flex items-center justify-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3 text-[var(--muted-foreground)]" />
                          <span className="text-xs text-[var(--muted-foreground)]">{table.capacity}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3 text-[var(--muted-foreground)]" />
                          <span className="text-xs text-[var(--muted-foreground)]">{table.scanCount}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`${viewMode === 'list' ? 'text-right lg:ml-4' : ''}`}>
                    <Badge className="bg-[var(--primary)] text-[var(--primary-foreground)] text-xs px-2 py-1 rounded-full mb-2">
                      {table.status.toUpperCase()}
                    </Badge>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      <div>Scanned: {table.lastScanned}</div>
                      <div className="font-semibold text-[var(--secondary)]">{table.scanCount} times today</div>
                    </div>
                  </div>
                </div>

                {/* Features - Responsive layout */}
                <div className={`flex flex-wrap gap-2 ${viewMode === 'grid' ? 'justify-center' : ''} ${viewMode === 'list' ? 'mt-4' : 'mt-4'}`}>
                  {table.features.slice(0, viewMode === 'grid' ? 4 : 6).map((feature, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="text-xs border-[var(--border)] text-[var(--foreground)]"
                    >
                      {feature}
                    </Badge>
                  ))}
                  {table.features.length > (viewMode === 'grid' ? 4 : 6) && (
                    <Badge 
                      variant="outline"
                      className="text-xs border-[var(--border)] text-[var(--muted-foreground)]"
                    >
                      +{table.features.length - (viewMode === 'grid' ? 4 : 6)}
                    </Badge>
                  )}
                </div>

                {/* URL Display - Responsive */}
                <div className="p-3 rounded-lg mt-4 bg-[var(--background)]">
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono truncate flex-1 text-[var(--muted-foreground)]">
                      {table.qrCodeUrl}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 ml-2 text-[var(--foreground)] hover:bg-[var(--accent)]"
                      onClick={() => copyToClipboard(table.qrCodeUrl, table.tableId)}
                    >
                      {copiedUrl === table.tableId ? (
                        <Check className="w-3 h-3 text-[var(--primary)]" />
                      ) : (
                        <Copy className="w-3 h-3 text-[var(--muted-foreground)]" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons - Responsive layout */}
                <div className={`${viewMode === 'grid' ? 'space-y-3' : 'grid grid-cols-2 gap-3'} mt-4`}>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        className="w-full bg-[var(--sidebar)] hover:bg-[var(--sidebar-accent)] text-[var(--sidebar-foreground)] rounded-xl h-12 font-semibold"
                        onClick={() => setSelectedTable(table)}
                      >
                        <Maximize className="w-4 h-4 mr-2" />
                        <span className={viewMode === 'grid' ? 'block' : 'hidden lg:block'}>View Full Size</span>
                        <span className={viewMode === 'list' ? 'block lg:hidden' : 'hidden'}>View</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[var(--card)] border-[var(--border)]">
                      <DialogHeader>
                        <DialogTitle className="text-center text-[var(--foreground)]">
                          {table.tableName} - QR Code
                        </DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col items-center space-y-6 p-6">
                        <div className="w-64 h-64 bg-white rounded-xl shadow-lg p-4">
                          <img 
                            src={generateQRCode(table.qrCodeUrl, 400)}
                            alt={`QR Code for ${table.tableName}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        
                        <div className="text-center space-y-2">
                          <h3 className="font-bold text-lg text-[var(--foreground)]">
                            Table {table.tableNumber}
                          </h3>
                          <p className="text-sm text-[var(--muted-foreground)]">
                            Scan with any smartphone camera to access the menu
                          </p>
                        </div>

                        {/* Device Icons */}
                        <div className="flex items-center justify-center space-x-6 text-[var(--muted-foreground)]">
                          <div className="text-center">
                            <Smartphone className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-xs">Phone</span>
                          </div>
                          <div className="text-center">
                            <Tablet className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-xs">Tablet</span>
                          </div>
                          <div className="text-center">
                            <Monitor className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-xs">Desktop</span>
                          </div>
                        </div>

                        {/* Full Screen Actions */}
                        <div className="flex space-x-3 w-full">
                          <Button 
                            variant="outline"
                            className="flex-1 rounded-xl h-12 border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--accent)]"
                            onClick={() => downloadQR(table.qrCodeUrl, table.tableName)}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button 
                            className="flex-1 bg-[var(--secondary)] hover:bg-[var(--secondary)]/90 text-[var(--secondary-foreground)] rounded-xl h-12 font-semibold"
                            onClick={() => shareQR(table.qrCodeUrl, table.tableName)}
                          >
                            <Share className="w-4 h-4 mr-2" />
                            Share
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex space-x-2'}`}>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[var(--secondary)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-[var(--secondary-foreground)] rounded-xl h-12"
                      onClick={() => downloadQR(table.qrCodeUrl, table.tableName)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      <span className={viewMode === 'grid' ? 'hidden lg:block' : 'hidden xl:block'}>Download</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded-xl h-12"
                      onClick={() => shareQR(table.qrCodeUrl, table.tableName)}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      <span className={viewMode === 'grid' ? 'hidden lg:block' : 'hidden xl:block'}>Share</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom spacing for mobile navigation */}
      <div className="h-4 md:h-0"></div>
    </div>
  );
}