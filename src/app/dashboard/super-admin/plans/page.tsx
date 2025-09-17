"use client";
import { useState } from "react";
import { Crown, Zap, Star, TrendingUp, LucideIcon } from "lucide-react";

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

// Plans: Free, Monthly, 6 Months, Yearly (benefits removed)
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
    subscribers: 145,
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
    subscribers: 287,
    revenue: 14063,
  },
  {
    id: "six-months",
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
    subscribers: 98,
    revenue: 9702,
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
    subscribers: 23,
    revenue: 6877,
  },
];

// Chart data (keys updated to match new plans)
const subscriptionTrends = [
  { month: "Jan", Free: 120, Monthly: 200, "6 Months": 80, Yearly: 15 },
  { month: "Feb", Free: 130, Monthly: 220, "6 Months": 85, Yearly: 18 },
  { month: "Mar", Free: 125, Monthly: 240, "6 Months": 90, Yearly: 20 },
  { month: "Apr", Free: 135, Monthly: 260, "6 Months": 95, Yearly: 21 },
  { month: "May", Free: 140, Monthly: 275, "6 Months": 98, Yearly: 22 },
  { month: "Jun", Free: 145, Monthly: 287, "6 Months": 98, Yearly: 23 },
];

const revenueTrends = [
  { month: "Jan", revenue: 25000 },
  { month: "Feb", revenue: 27500 },
  { month: "Mar", revenue: 29000 },
  { month: "Apr", revenue: 30500 },
  { month: "May", revenue: 31200 },
  { month: "Jun", revenue: 30642 },
];

const planDistribution = [
  { name: "Free", value: 145, color: "#6b7280" },
  { name: "Monthly", value: 287, color: "#3b82f6" },
  { name: "6 Months", value: 98, color: "#8b5cf6" },
  { name: "Yearly", value: 23, color: "#f59e0b" },
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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <div className="min-h-screen dark:from-background dark:via-background dark:to-background">
      <div className="py-2 space-y-10">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Subscription Plans</h1>
            <p className="text-muted-foreground">Choose the perfect plan for your hotel business</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border p-2 bg-background shadow-sm">
            <Button
              variant={billingCycle === "monthly" ? "default" : "ghost"}
              size="sm"
              className="text-xs px-3"
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </Button>
            <Button
              variant={billingCycle === "yearly" ? "default" : "ghost"}
              size="sm"
              className="text-xs px-3"
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <Badge className="ml-2" variant="secondary">
                Save 16%
              </Badge>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total Subscribers</CardDescription>
              <CardTitle className="text-3xl">{totalSubscribers.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Monthly Revenue</CardDescription>
              <CardTitle className="text-3xl">${totalRevenue.toLocaleString()}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Conversion Rate</CardDescription>
              <CardTitle className="text-3xl">74.2%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Churn Rate</CardDescription>
              <CardTitle className="text-3xl">2.8%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Plan Cards (no benefits list) */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => {
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
                    <span className={`text-3xl font-bold ${colors.text}`}>${plan.price[billingCycle]}</span>
                    <span className="text-muted-foreground">/{billingCycle === "monthly" ? "month" : "year"}</span>
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
                <LineChart data={subscriptionTrends} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
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
                      <Pie data={planDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                        {planDistribution.map((entry, index) => (
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
                  {planDistribution.map((item) => (
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
              {plans.map((plan) => {
                const colors = planColorStyles[plan.color] || planColorStyles.gray;
                const percentage = (plan.subscribers / totalSubscribers) * 100;
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