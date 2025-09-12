"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Plus,
  UserPlus,
  FileText,
  MoreHorizontal,
  Filter,
  Edit,
  Trash2,
  Building,
  Calendar,
  Activity
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from "recharts";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import UpdateHotelModal from "@/components/hotels/edit-hotel-modal";
import { toggleEditModal, setSelectedHotel } from "@/store/slices/hotel-store";
import { RootState } from "@/store/store";

// Enhanced dummy data with different time periods
const overviewData = {
  weekly: {
    totalRevenue: 38500,
    activeHotels: 342,
    monthlyBookings: 687,
    staffCount: 1259
  },
  monthly: {
    totalRevenue: 156874,
    activeHotels: 342,
    monthlyBookings: 2847,
    staffCount: 1259
  },
  yearly: {
    totalRevenue: 1876450,
    activeHotels: 342,
    monthlyBookings: 34567,
    staffCount: 1259
  }
};

const chartData = {
  weekly: [
    { name: 'Mon', bookings: 340, revenue: 5200, occupancy: 78 },
    { name: 'Tue', bookings: 290, revenue: 4800, occupancy: 72 },
    { name: 'Wed', bookings: 410, revenue: 6100, occupancy: 85 },
    { name: 'Thu', bookings: 380, revenue: 5900, occupancy: 82 },
    { name: 'Fri', bookings: 520, revenue: 7800, occupancy: 92 },
    { name: 'Sat', bookings: 670, revenue: 9200, occupancy: 96 },
    { name: 'Sun', bookings: 580, revenue: 8100, occupancy: 89 },
  ],
  monthly: [
    { name: 'Jan', bookings: 2400, revenue: 40000, occupancy: 65 },
    { name: 'Feb', bookings: 1398, revenue: 30000, occupancy: 59 },
    { name: 'Mar', bookings: 9800, revenue: 20000, occupancy: 80 },
    { name: 'Apr', bookings: 3908, revenue: 27800, occupancy: 81 },
    { name: 'May', bookings: 4800, revenue: 18900, occupancy: 56 },
    { name: 'Jun', bookings: 3800, revenue: 23900, occupancy: 75 },
  ],
  yearly: [
    { name: '2019', bookings: 28400, revenue: 450000, occupancy: 68 },
    { name: '2020', bookings: 21200, revenue: 380000, occupancy: 52 },
    { name: '2021', bookings: 35600, revenue: 520000, occupancy: 74 },
    { name: '2022', bookings: 42800, revenue: 680000, occupancy: 82 },
    { name: '2023', bookings: 48200, revenue: 850000, occupancy: 89 },
    { name: '2024', bookings: 52100, revenue: 920000, occupancy: 92 },
  ]
};

// Dynamic hotels will be loaded from API into hotelsData

const subscriptionPlans = [
  { name: "Free", hotels: 45, maxBandwidth: 100, usedBandwidth: 65, color: "bg-green-100 border-green-300" },
  { name: "Monthly", hotels: 78, maxBandwidth: 300, usedBandwidth: 190, color: "bg-blue-100 border-blue-300" },
  { name: "6-Months", hotels: 95, maxBandwidth: 700, usedBandwidth: 400, color: "bg-yellow-100 border-yellow-300" },
  { name: "Yearly", hotels: 120, maxBandwidth: 1500, usedBandwidth: 950, color: "bg-purple-100 border-purple-300" },
];


const recentActivity = [
  { id: 1, action: "New hotel registered", user: "Grand Plaza Hotel", time: "2 minutes ago", avatar: "GP", type: "success" },
  { id: 2, action: "Subscription upgraded", user: "Ocean View Resort", time: "1 hour ago", avatar: "OV", type: "info" },
  { id: 3, action: "Payment failed", user: "John Doe", time: "3 hours ago", avatar: "JD", type: "warning" },
  { id: 4, action: "Payment received", user: "Mountain Lodge", time: "5 hours ago", avatar: "ML", type: "success" },
  { id: 5, action: "Support ticket resolved", user: "City Center Inn", time: "1 day ago", avatar: "CC", type: "info" },
];


export default function Dashboard() {
  type HotelType = {
    id: string;
    name: string;
    status: string;
    plan?: string;
    tenant_id?: string;
    [key: string]: unknown;
  };
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("All");
  const [hotelsData, setHotelsData] = useState<HotelType[]>([]);

  const currentData = overviewData[selectedPeriod as keyof typeof overviewData];
  const currentChartData = chartData[selectedPeriod as keyof typeof chartData];

  const dispatch = useDispatch();
  const isEditModelOpen = useSelector((state: RootState) => (state.hotel as { isEditModelOpen: boolean }).isEditModelOpen);

  const filteredHotels = hotelsData.filter((hotel) => {
    if (selectedPlan === "All") return true;
    const plan = (hotel as unknown as { plan?: string }).plan?.toLowerCase();
    const wanted = selectedPlan.toLowerCase();
    return plan === wanted;
  });

  const getHotelsData = async () => {
    try {
      const res = await fetch("/api/super-admin/hotels");
      if (!res.ok) {
        throw new Error("Failed to fetch hotels");
      }
      const data = await res.json();

      return Array.isArray(data.hotels) ? data.hotels : [];
    } catch (error) {
      console.error("Error fetching hotels:", error);
      return [];
    }
  };


  useEffect(() => {
    getHotelsData().then(data => setHotelsData(data));
  }, []);

  const stats = {
    total: hotelsData.length,
    active: hotelsData.filter(h => h.status === "active").length,
    trial: hotelsData.filter(h => h.status === "trial").length,
    expired: hotelsData.filter(h => h.status === "expired").length,
    suspended: hotelsData.filter(h => h.status === "suspended").length,
  };


  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border border-green-300"; 
      case "trial":
        return "bg-blue-100 text-blue-800 border border-blue-300"; 
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300"; 
      case "expired":
        return "bg-red-100 text-red-800 border border-red-300"; 
      default:
        return "bg-gray-100 text-gray-800 border border-gray-300"; 
    }
  }

const getPlanBadgeStyle = (plan?: string) => {
  switch (plan) {
    case "free":
      return "bg-purple-900 text-white border border-purple-900"; 
    case "monthly":
      return "bg-pink-900 text-white border border-pink-900";       
    case "6-months":
      return "bg-orange-700 text-white border border-orange-700";
    case "yearly":
      return "bg-teal-800 text-white border border-teal-800";    
    default:
      return "bg-gray-100 text-gray-800 border border-gray-300";
  }
};



  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  };

  const handleEditHotel = (hotel: HotelType) => {
    dispatch(setSelectedHotel(hotel as unknown as HotelType));
    dispatch(toggleEditModal(true));
  };

  const handleDeleteHotel = async (hotelId: string) => {
    try {
      const res = await fetch("/api/super-admin/hotels", {
        method: "DELETE",
        body: JSON.stringify({ id: hotelId }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete hotel");
        return;
      }
      toast.success("Hotel deleted successfully");
      getHotelsData().then(data => setHotelsData(data));
    } catch {
      toast.error("An error occurred while deleting the hotel");
    }
  };

  const handleUpdateHotel = async (formData: Partial<HotelType> & { id: string }) => {
    try {
      const res = await fetch("/api/super-admin/hotels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update hotel");
        return;
      }
      toast.success("Hotel updated successfully");
      dispatch(toggleEditModal(false));
      getHotelsData().then(data => setHotelsData(data));
    } catch {
      toast.error("An error occurred while updating the hotel");
    }
  };
  return (
    <div className="flex-1 space-y-8 bg-[var(--color-background)] text-[var(--color-foreground)] font-sans">
      {/* Time Period Tabs */}
      <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod} className="space-y-8">
        <div className="flex flex-col items-center sm:flex-row gap-4 justify-between mb-4">
          <TabsList className="grid w-full max-w-[400px] grid-cols-3 rounded-xl bg-[var(--color-card)] shadow">
            <TabsTrigger value="weekly" className="rounded-xl data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-primary-foreground)] transition">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-xl data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-primary-foreground)] transition">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="rounded-xl data-[state=active]:bg-[var(--color-primary)] data-[state=active]:text-[var(--color-primary-foreground)] transition">Yearly</TabsTrigger>
          </TabsList>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" className="rounded-lg shadow hover:bg-[var(--color-muted)] transition">
              <Calendar className="w-4 h-4 mr-2" />
              Custom Range
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg shadow hover:bg-[var(--color-muted)] transition">
                  <Filter className="w-4 h-4 mr-2" />
                  Quick Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl shadow-lg bg-[var(--color-popover)]">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/super-admin/hotels?add=true" className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Hotel
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite User
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <TabsContent value={selectedPeriod} className="space-y-8">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-[var(--color-primary)]">Total Revenue</CardTitle>
                <DollarSign className="h-5 w-5 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--color-foreground)]">${currentData.totalRevenue.toLocaleString()}</div>
                <div className="flex items-center text-xs text-[var(--color-muted-foreground)] mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="font-medium">+12.5%</span> from last {selectedPeriod.slice(0, -2)}
                </div>
                <div className="mt-4 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={currentChartData.slice(-4)}>
                      <defs>
                        <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="var(--primary)"
                        fillOpacity={1}
                        fill="url(#revenue)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Repeat for other cards, updating icons/colors as needed */}
            <Card className="border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-[var(--color-primary)]">Active Hotels</CardTitle>
                <Building className="h-5 w-5 text-[var(--color-primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--color-foreground)]"> {stats.active}</div>
                <div className="flex items-center text-xs text-[var(--color-muted-foreground)] mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="font-medium">+8.2%</span> from last {selectedPeriod.slice(0, -2)}
                </div>
                <div className="mt-4 h-[60px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentChartData.slice(-4)}>
                      <Bar dataKey="bookings" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Charts Section */}
          <div className="grid gap-8 md:grid-cols">
            <Card className="col-span-4 border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-primary)]">Analytics Overview</CardTitle>
                <CardDescription className="text-[var(--color-muted-foreground)]">
                  Revenue and booking trends for the selected period
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {/* ...existing chart code... */}
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={currentChartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-[var(--color-muted)]" />
                    <XAxis
                      dataKey="name"
                      className="stroke-[var(--color-muted-foreground)]"
                      fontSize={12}
                    />
                    <YAxis
                      className="stroke-[var(--color-muted-foreground)]"
                      fontSize={12}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--background)',
                        border: '1px solid var(--border)',
                        borderRadius: 'calc(var(--radius))',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--primary)', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: 'var(--primary)', strokeWidth: 2, fill: 'var(--background)' }}
                      name="Bookings"
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--secondary)"
                      strokeWidth={2}
                      dot={{ fill: 'var(--secondary)', strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, stroke: 'var(--secondary)', strokeWidth: 2, fill: 'var(--background)' }}
                      name="Revenue"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

          </div>

          {/* Hotels and Activity */}
          <div className="grid gap-8 grid-cols-1 md:grid-cols-7">
            <Card className="col-span-4 border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
              {/* ...existing hotels table code, update badge and button classes for rounded/contrast... */}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-[var(--color-primary)]">Recent Hotels</CardTitle>
                    <CardDescription className="text-[var(--color-muted-foreground)]">Latest hotel registrations</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg">
                        <Filter className="w-4 h-4 mr-2" />
                        {selectedPlan}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setSelectedPlan("All")}>All Plans</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPlan("Free")}>Free</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPlan("Monthly")}>Monthly</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPlan("6-Months")}>6-Months</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSelectedPlan("Yearly")}>Yearly</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hotel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHotels.length > 0 ? (
                      filteredHotels.slice(0, 5).map((hotel) => (
                        <TableRow key={hotel.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8 rounded-lg">
                                <AvatarFallback className="text-xs font-medium">
                                  {(hotel.name || "")
                                    .split(" ")
                                    .map((w: string) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-[var(--color-foreground)]">
                                  {hotel.name}
                                </div>
                                <div className="text-sm text-[var(--color-muted-foreground)]">
                                  {(hotel as unknown as { owner_name?: string }).owner_name}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={`rounded-lg ${getStatusBadgeVariant(hotel.status as string)}`}
                            >
                              {hotel.status as string}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={`rounded-lg ${getPlanBadgeStyle(hotel.plan)}`}>
                              {hotel.plan}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium text-[var(--color-foreground)]">
                            -
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-lg">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditHotel(hotel)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteHotel(hotel.id as string)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6">
                          <p className="text-sm text-[var(--color-muted-foreground)]">
                            No hotels match your filter
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>

                </Table>
              </CardContent>
            </Card>
            {/* Edit Hotel Modal */}
            <UpdateHotelModal
              open={isEditModelOpen}
              onOpenChange={(open) => dispatch(toggleEditModal(open))}
              onSubmit={handleUpdateHotel}
            />
            <Card className="col-span-3 max-md:col-span-4 border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
              {/* ...existing activity code, update icon and text classes for color/contrast... */}
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-[var(--color-primary)]">Recent Activity</CardTitle>
                <CardDescription className="text-[var(--color-muted-foreground)]">Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarFallback className="text-xs font-medium">{activity.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-[var(--color-foreground)]">
                          {activity.action}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-[var(--color-muted-foreground)]">
                            {activity.user}
                          </p>
                          <div className="h-1 w-1 bg-[var(--color-muted-foreground)] rounded-full" />
                          <p className="text-xs text-[var(--color-muted-foreground)]">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      <Activity className={`h-4 w-4 ${getActivityTypeColor(activity.type)}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Subscription Plans Overview */}
          <Card className="border-0 shadow-lg rounded-xl bg-[var(--color-card)]">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-[var(--color-primary)]">Subscription Overview</CardTitle>
              <CardDescription className="text-[var(--color-muted-foreground)]">Plan distribution and bandwidth usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                {subscriptionPlans.map((plan, index) => (
                  <div key={index} className={`space-y-3 rounded-xl border p-5 ${plan.color} shadow hover:shadow-lg transition`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-[var(--color-foreground)]">{plan.name}</h4>
                      <Badge variant="secondary" className="rounded-lg">{plan.hotels} hotels</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-muted-foreground)]">Bandwidth</span>
                        <span className="font-medium text-[var(--color-foreground)]">
                          {plan.usedBandwidth}GB / {plan.maxBandwidth}GB
                        </span>
                      </div>
                      <Progress
                        value={(plan.usedBandwidth / plan.maxBandwidth) * 100}
                        className="h-2 rounded-full bg-[var(--color-muted)]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
