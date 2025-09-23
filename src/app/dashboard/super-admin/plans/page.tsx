"use client";
import { Crown, Zap, Star, TrendingUp, LucideIcon, Users, DollarSign, LogOut } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { } from 'lucide-react';
import { useEffect, useState } from "react";
import { HotelType } from "@/types";
interface Plan {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  description: string;
  icon: LucideIcon;
  color: string;
  limits: {
    hotels: string | number;
    users: string | number;
    bandwidth: string;
    support: string;
  };
  popular: boolean;
  subscribers: number;
  revenue: number;
}
interface PlanColorStyle {
  bg: string;
  border: string;
  text: string;
  icon: string;
  button: string;
  progress: string;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    icon: Star,
    color: "gray",
    limits: {
      hotels: 1,
      users: 5,
      bandwidth: "10GB",
      support: "Email",
    },
    popular: false,
    subscribers: 0,
    revenue: 0, 
  },
  {
    id: "monthly",
    name: "Monthly",
    price: { monthly: 49, yearly: 490 },
    description: "Best for growing hotels",
    icon: Zap,
    color: "blue",
    limits: {
      hotels: 5,
      users: 25,
      bandwidth: "100GB",
      support: "Priority Email",
    },
    popular: true,
    subscribers: 0,
    revenue: 0,
  },
  {
    id: "6-months",
    name: "6 Months",
    price: { monthly: 99, yearly: 990 },
    description: "For professional hotel chains",
    icon: TrendingUp,
    color: "purple",
    limits: {
      hotels: 15,
      users: 100,
      bandwidth: "500GB",
      support: "24/7 Phone & Email",
    },
    popular: false,
    subscribers: 0, 
    revenue: 0,     
  },
  {
    id: "yearly",
    name: "Yearly",
    price: { monthly: 299, yearly: 2990 },
    description: "For large hotel enterprises",
    icon: Crown,
    color: "amber",
    limits: {
      hotels: "∞",
      users: "∞",
      bandwidth: "Unlimited",
      support: "Dedicated Manager",
    },
    popular: false,
    subscribers: 0, 
    revenue: 0,    
  },
];

// Chart data (keys updated to match new plans)
const revenueTrends = [
  { month: "Jan", revenue: 25000 },
  { month: "Feb", revenue: 27500 },
  { month: "Mar", revenue: 29000 },
  { month: "Apr", revenue: 30500 },
  { month: "May", revenue: 31200 },
  { month: "Jun", revenue: 30642 },
];

const planColorStyles: Record<string, PlanColorStyle> = {
  gray: {
    bg: "bg-muted/50",
    border: "border-border",
    text: "text-foreground",
    icon: "text-muted-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
    progress: "bg-primary",
  },
  blue: {
    bg: "bg-blue-500/10 dark:bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-800 dark:text-blue-300",
    icon: "text-blue-500",
    button:
      "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
    progress: "bg-blue-500",
  },
  purple: {
    bg: "bg-purple-500/10 dark:bg-purple-500/5",
    border: "border-purple-500/20",
    text: "text-purple-800 dark:text-purple-300",
    icon: "text-purple-600 dark:text-purple-400",
    button:
      "bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600",
    progress: "bg-purple-500",
  },
  amber: {
    bg: "bg-amber-500/10 dark:bg-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-800 dark:text-amber-300",
    icon: "text-amber-600 dark:text-amber-400",
    button:
      "bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600",
    progress: "bg-amber-500",
  },
};

export default function Plans() {
  const [hotelsData, setHotelsData] = useState<HotelType[]>([]);

  // Plan mappings needed for dynamic analytics
  const planIdToName: Record<string, string> = {
    "free": "Free",
    "monthly": "Monthly",
    "6-months": "6 Months",
    "yearly": "Yearly",
  };

  const planIdToColor: Record<string, string> = {
    "free": "#6b7280",
    "monthly": "#3b82f6",
    "6-months": "#8b5cf6",
    "yearly": "#f59e0b",
  };

  const dynamicPlanDistribution = Object.entries(planIdToName).map(([id, name]) => ({
    name,
    value: hotelsData.filter(h => h.plan === id).length,
    color: planIdToColor[id],
  }));

  const months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  });

  const dynamicSubscriptionTrends = months.map((label, i) => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setMonth(monthStart.getMonth() - (5 - i));
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    return {
      month: label,
      ...Object.entries(planIdToName).reduce((acc, [id, name]) => {
        acc[name] = hotelsData.filter(h =>
          h.plan === id &&
          h.start_date &&
          new Date(h.start_date) >= monthStart &&
          new Date(h.start_date) < monthEnd
        ).length;
        return acc;
      }, {} as Record<string, number>),
    };
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


  const dynamicPlans = plans.map(plan => {
    const hotels = hotelsData.filter(h => h.plan === plan.id);
    let revenue = 0;
    if (plan.id === "monthly") revenue = hotels.length * plan.price.monthly;
    else if (plan.id === "6-months") revenue = hotels.length * plan.price.monthly * 6;
    else if (plan.id === "yearly") revenue = hotels.length * plan.price.yearly;
    // free plan = 0
    return {
      ...plan,
      subscribers: hotels.length,
      revenue,
    };
  });
  const totalSubscribers = dynamicPlans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = dynamicPlans.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <div className="min-h-screen dark:from-background dark:via-background dark:to-background">
      <div className="py-2 space-y-10">

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="p-4">
                <CardDescription className="text-gray-500">Total Subscribers</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{totalSubscribers.toLocaleString()}</CardTitle>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="p-4">
                <CardDescription className="text-gray-500">Monthly Revenue</CardDescription>
                <CardTitle className="text-3xl text-green-600">${totalRevenue.toLocaleString()}</CardTitle>
              </div>
              <DollarSign className="h-6 w-6 text-green-600" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="p-4">
                <CardDescription className="text-gray-500">Conversion Rate</CardDescription>
                <CardTitle className="text-3xl text-purple-600">74.2%</CardTitle>
              </div>
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="p-4">
                <CardDescription className="text-gray-500">Churn Rate</CardDescription>
                <CardTitle className="text-3xl text-red-600">2.8%</CardTitle>
              </div>
              <LogOut className="h-6 w-6 text-red-600" />
            </CardHeader>
          </Card>
        </div>

        {/* Plan Cards (no benefits list) */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {dynamicPlans.map((plan) => {
            const colors = planColorStyles[plan.color] || planColorStyles.gray;
            const IconComponent = plan.icon;

            return (
              <Card key={plan.id} className={`${colors.bg} ${colors.border} border`}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`rounded-full p-2 ${colors.icon} bg-background/60 border`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {plan.popular && <Badge>Most Popular</Badge>}
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${colors.text}`}>${plan.price.yearly}</span>
                    <span className="text-muted-foreground">/year</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md border border-gray-300 p-3">
                      <div className="text-muted-foreground">Subscribers</div>
                      <div className="font-semibold">{plan.subscribers}</div>
                    </div>
                    <div className="rounded-md border border-gray-300 p-3">
                      <div className="text-muted-foreground">Monthly Revenue</div>
                      <div className="font-semibold">${plan.revenue.toLocaleString()}</div>
                    </div>
                  </div>
                  <Button className={`w-full ${colors.button}`}>{plan.id === "monthly" ? "Current Plan" : "Manage Plan"}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Subscription Trends</CardTitle>
              <CardDescription>Monthly subscriber growth by plan</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dynamicSubscriptionTrends} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickMargin={8} stroke="currentColor" className="text-xs fill-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-xs fill-muted-foreground" />
                  <Tooltip
                    formatter={(value: unknown) => [value as React.ReactNode, "Subscribers"]}
                  />
                  <Line type="monotone" dataKey="Free" stroke="#6b7280" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Monthly" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="6 Months" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Yearly" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Distribution</CardTitle>
              <CardDescription>Current subscriber breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex flex-col gap-2 h-full">
                <div className="h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={dynamicPlanDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                        {dynamicPlanDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: unknown, name: string) => [
                          value as React.ReactNode,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center gap-3">
                  {dynamicPlanDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Revenue Trends</CardTitle>
              <CardDescription>Monthly recurring revenue growth</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrends} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tickMargin={8} stroke="currentColor" className="text-xs fill-muted-foreground" />
                  <YAxis stroke="currentColor" className="text-xs fill-muted-foreground" />
                  <Tooltip formatter={(value: unknown) => [`$${Number(value).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#f59e0a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan Performance</CardTitle>
              <CardDescription>Detailed breakdown of each subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dynamicPlans.map((plan) => {
                const colors = planColorStyles[plan.color] || planColorStyles.gray;
                const percentage = totalSubscribers > 0 ? (plan.subscribers / totalSubscribers) * 100 : 0;
                return (
                  <div key={plan.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{plan.name}</div>
                      <div className="text-sm text-muted-foreground">{plan.subscribers} subscribers</div>
                    </div>
                    <Progress className={`h-2 overflow-hidden [&_div]:bg-primary ${colors.progress}`} value={percentage} />
                    <div className="text-right text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}