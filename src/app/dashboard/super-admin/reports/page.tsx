"use client"
import { useState } from "react";
import { 
  Download, 
  FileText, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building,
  Clock,
  Filter,
  RefreshCw,
  CalendarIcon
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Dummy data for charts and reports
const revenueData = [
  { month: 'Jan 2024', revenue: 145000, bookings: 1240, occupancy: 78 },
  { month: 'Feb 2024', revenue: 132000, bookings: 1180, occupancy: 72 },
  { month: 'Mar 2024', revenue: 168000, bookings: 1450, occupancy: 85 },
  { month: 'Apr 2024', revenue: 156000, bookings: 1320, occupancy: 82 },
  { month: 'May 2024', revenue: 174000, bookings: 1520, occupancy: 88 },
  { month: 'Jun 2024', revenue: 189000, bookings: 1680, occupancy: 92 },
];

const topPerformingHotels = [
  { name: "Royal Gardens Hotel", revenue: 52000, bookings: 420, growth: 12.5, occupancy: 91 },
  { name: "Grand Plaza Hotel", revenue: 45000, bookings: 380, growth: 8.2, occupancy: 85 },
  { name: "Business Suites", revenue: 35000, bookings: 290, growth: 15.7, occupancy: 78 },
  { name: "Ocean View Resort", revenue: 32000, bookings: 260, growth: 6.3, occupancy: 72 },
  { name: "Mountain Lodge", revenue: 28000, bookings: 220, growth: -2.1, occupancy: 68 },
];

const trafficHours = [
  { hour: '6:00', bookings: 15 },
  { hour: '8:00', bookings: 45 },
  { hour: '10:00', bookings: 89 },
  { hour: '12:00', bookings: 124 },
  { hour: '14:00', bookings: 145 },
  { hour: '16:00', bookings: 142 },
  { hour: '18:00', bookings: 129 },
  { hour: '20:00', bookings: 98 },
  { hour: '22:00', bookings: 54 },
];

const channelData = [
  { name: 'Direct Website', value: 40, color: 'var(--primary)' },
  { name: 'Booking.com', value: 25, color: 'var(--secondary)' },
  { name: 'Expedia', value: 20, color: 'var(--accent)' },
  { name: 'Airbnb', value: 10, color: 'var(--muted)' },
  { name: 'Other OTAs', value: 5, color: 'var(--destructive)' },
];

const detailedReports = [
  {
    id: 1,
    title: "Monthly Revenue Report",
    type: "Financial",
    period: "June 2024",
    status: "generated",
    size: "2.3 MB",
    generatedAt: "2024-01-15 14:30",
    format: "PDF"
  },
  {
    id: 2,
    title: "Hotel Performance Analysis",
    type: "Operations",
    period: "Q2 2024",
    status: "generated",
    size: "5.7 MB",
    generatedAt: "2024-01-15 10:20",
    format: "Excel"
  },
  {
    id: 3,
    title: "User Activity Report",
    type: "Analytics",
    period: "Last 30 days",
    status: "generating",
    size: "-",
    generatedAt: "-",
    format: "CSV"
  },
  {
    id: 4,
    title: "Booking Trends Analysis",
    type: "Analytics",
    period: "June 2024",
    status: "generated",
    size: "1.8 MB",
    generatedAt: "2024-01-14 16:45",
    format: "PDF"
  },
];

export default function Reports() {
  const [date, setDate] = useState<Date>();
  const [hotelFilter, setHotelFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");

  const handleExport = (format: string, type: string) => {
    console.log(`Exporting ${type} as ${format}`);
  };

  const handleGenerateReport = (reportType: string) => {
    console.log(`Generating ${reportType} report`);
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0);
  const avgOccupancy = revenueData.reduce((sum, item) => sum + item.occupancy, 0) / revenueData.length;
  
  return (
      <div className="flex-1 space-y-6 p-6">
        {/* Header with Date Picker and Filters */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle>Analytics & Reports</CardTitle>
                <CardDescription>
                  Comprehensive insights and detailed reports for your hotel business
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleGenerateReport('custom')}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" onClick={() => handleExport('pdf', 'dashboard')}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full sm:w-[240px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <Select value={hotelFilter} onValueChange={setHotelFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Building className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Hotels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Hotels</SelectItem>
                  <SelectItem value="grand-plaza">Grand Plaza Hotel</SelectItem>
                  <SelectItem value="ocean-view">Ocean View Resort</SelectItem>
                  <SelectItem value="city-center">City Center Inn</SelectItem>
                  <SelectItem value="mountain-lodge">Mountain Lodge</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Plans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Plans</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +12.5% vs last period
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBookings.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +8.2% vs last period
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Occupancy</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgOccupancy.toFixed(1)}%</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                -2.1% vs last period
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,259</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +5.4% vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="hotels">Hotels</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
          </TabsList>
          
          <TabsContent value="revenue" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Revenue & Bookings Trends</CardTitle>
                    <CardDescription>Monthly performance over the last 6 months</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'revenue')}>
                      <Download className="w-4 h-4 mr-2" />
                      CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('pdf', 'revenue')}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="bookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="stroke-muted-foreground" fontSize={12} />
                    <YAxis className="stroke-muted-foreground" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: 'calc(var(--radius))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--primary)" 
                      fillOpacity={1}
                      fill="url(#revenue)"
                      strokeWidth={2}
                      name="Revenue ($)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="var(--secondary)" 
                      fillOpacity={1}
                      fill="url(#bookings)"
                      strokeWidth={2}
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hotels" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Hotels</CardTitle>
                    <CardDescription>Revenue and performance metrics by hotel</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('excel', 'hotels')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel Name</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Growth</TableHead>
                      <TableHead>Occupancy</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topPerformingHotels.map((hotel, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{hotel.name}</TableCell>
                        <TableCell>${hotel.revenue.toLocaleString()}</TableCell>
                        <TableCell>{hotel.bookings}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {hotel.growth >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                            )}
                            <span className={hotel.growth >= 0 ? "text-green-600" : "text-red-600"}>
                              {hotel.growth >= 0 ? "+" : ""}{hotel.growth}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              hotel.occupancy >= 80 ? "default" :
                              hotel.occupancy >= 60 ? "secondary" : "destructive"
                            }
                          >
                            {hotel.occupancy}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Peak Traffic Hours</CardTitle>
                    <CardDescription>Booking activity throughout the day</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv', 'traffic')}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={trafficHours}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="hour" className="stroke-muted-foreground" fontSize={12} />
                    <YAxis className="stroke-muted-foreground" fontSize={12} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: 'calc(var(--radius))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="bookings" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="channels" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Booking Channels</CardTitle>
                  <CardDescription>Revenue distribution by booking source</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={channelData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {channelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {channelData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">{item.name}</span>
                        </div>
                        <span className="text-sm font-medium">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Channel Performance</CardTitle>
                  <CardDescription>Commission and conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {channelData.map((channel, index) => (
                      <div key={index} className="space-y-2 rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{channel.name}</h4>
                          <Badge variant="outline">{channel.value}% share</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Commission Rate</span>
                            <p className="font-medium">
                              {channel.name === 'Direct Website' ? '0%' : 
                               channel.name === 'Booking.com' ? '15%' :
                               channel.name === 'Expedia' ? '18%' :
                               channel.name === 'Airbnb' ? '12%' : '14%'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Conversion Rate</span>
                            <p className="font-medium">
                              {channel.name === 'Direct Website' ? '4.2%' : 
                               channel.name === 'Booking.com' ? '2.8%' :
                               channel.name === 'Expedia' ? '2.1%' :
                               channel.name === 'Airbnb' ? '3.5%' : '2.4%'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Generated Reports */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Download previously generated reports and analytics</CardDescription>
              </div>
              <Button onClick={() => handleGenerateReport('new')}>
                <FileText className="w-4 h-4 mr-2" />
                Generate New Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.type}</Badge>
                    </TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={report.status === "generated" ? "default" : "secondary"}
                      >
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{report.generatedAt}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {report.status === "generated" ? (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Download {report.format}
                        </Button>
                      ) : (
                        <span className="text-sm text-muted-foreground">Processing...</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
