"use client"

import { useState } from "react";
import { 
  Check, 
  Crown, 
  Zap, 
  Star,
  TrendingUp,
  Users,
  Building
} from "lucide-react";

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
  Cell
} from "recharts";

// Plan data
const plans = [
  {
    id: "free",
    name: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect for getting started",
    icon: Star,
    color: "gray",
    features: [
      "1 Hotel Property",
      "Up to 5 Users",
      "Basic Booking Management",
      "Email Support",
      "10GB Storage",
      "Basic Analytics"
    ],
    limits: {
      hotels: 1,
      users: 5,
      bandwidth: "10GB",
      support: "Email"
    },
    popular: false,
    subscribers: 145,
    revenue: 0
  },
  {
    id: "standard",
    name: "Standard",
    price: { monthly: 49, yearly: 490 },
    description: "Best for growing hotels",
    icon: Building,
    color: "blue",
    features: [
      "Up to 5 Hotel Properties",
      "Up to 25 Users",
      "Advanced Booking Management",
      "Priority Email Support",
      "100GB Storage",
      "Advanced Analytics",
      "Custom Branding",
      "API Access"
    ],
    limits: {
      hotels: 5,
      users: 25,
      bandwidth: "100GB",
      support: "Priority Email"
    },
    popular: true,
    subscribers: 287,
    revenue: 14063
  },
  {
    id: "pro",
    name: "Pro",
    price: { monthly: 99, yearly: 990 },
    description: "For professional hotel chains",
    icon: Zap,
    color: "purple",
    features: [
      "Up to 15 Hotel Properties",
      "Up to 100 Users",
      "Complete Hotel Management Suite",
      "24/7 Phone & Email Support",
      "500GB Storage",
      "Advanced Analytics & Reports",
      "Custom Branding & White-label",
      "Full API Access",
      "Multi-location Management",
      "Revenue Management Tools"
    ],
    limits: {
      hotels: 15,
      users: 100,
      bandwidth: "500GB",
      support: "24/7 Phone & Email"
    },
    popular: false,
    subscribers: 98,
    revenue: 9702
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: { monthly: 299, yearly: 2990 },
    description: "For large hotel enterprises",
    icon: Crown,
    color: "amber",
    features: [
      "Unlimited Hotel Properties",
      "Unlimited Users",
      "Complete Enterprise Suite",
      "Dedicated Account Manager",
      "Unlimited Storage",
      "Custom Analytics & BI",
      "Full White-label Solution",
      "Enterprise API & Integrations",
      "Multi-tenant Architecture",
      "Custom Development",
      "SLA Guarantee",
      "On-premise Deployment"
    ],
    limits: {
      hotels: "∞",
      users: "∞",
      bandwidth: "Unlimited",
      support: "Dedicated Manager"
    },
    popular: false,
    subscribers: 23,
    revenue: 6877
  }
];

// Chart data
const subscriptionTrends = [
  { month: 'Jan', Free: 120, Standard: 200, Pro: 80, Enterprise: 15 },
  { month: 'Feb', Free: 130, Standard: 220, Pro: 85, Enterprise: 18 },
  { month: 'Mar', Free: 125, Standard: 240, Pro: 90, Enterprise: 20 },
  { month: 'Apr', Free: 135, Standard: 260, Pro: 95, Enterprise: 21 },
  { month: 'May', Free: 140, Standard: 275, Pro: 98, Enterprise: 22 },
  { month: 'Jun', Free: 145, Standard: 287, Pro: 98, Enterprise: 23 },
];

const revenueTrends = [
  { month: 'Jan', revenue: 25000 },
  { month: 'Feb', revenue: 27500 },
  { month: 'Mar', revenue: 29000 },
  { month: 'Apr', revenue: 30500 },
  { month: 'May', revenue: 31200 },
  { month: 'Jun', revenue: 30642 },
];

const planDistribution = [
  { name: 'Free', value: 145, color: '#6b7280' },
  { name: 'Standard', value: 287, color: '#3b82f6' },
  { name: 'Pro', value: 98, color: '#8b5cf6' },
  { name: 'Enterprise', value: 23, color: '#f59e0b' },
];


const planColorStyles = {
    gray: {
        bg: 'bg-muted/50',
        border: 'border-border',
        text: 'text-foreground',
        icon: 'text-muted-foreground',
        button: 'bg-primary text-primary-foreground hover:bg-primary/90',
        progress: 'bg-primary'
    },
    blue: {
        bg: 'bg-blue-500/10 dark:bg-blue-500/5',
        border: 'border-blue-500/20',
        text: 'text-blue-800 dark:text-blue-300',
        icon: 'text-blue-500',
        button: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        progress: 'bg-blue-500'
    },
    purple: {
        bg: 'bg-purple-500/10 dark:bg-purple-500/5',
        border: 'border-purple-500/20',
        text: 'text-purple-800 dark:text-purple-300',
        icon: 'text-purple-600 dark:text-purple-400',
        button: 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
        progress: 'bg-purple-500'
    },
    amber: {
        bg: 'bg-amber-500/10 dark:bg-amber-500/5',
        border: 'border-amber-500/20',
        text: 'text-amber-800 dark:text-amber-300',
        icon: 'text-amber-600 dark:text-amber-400',
        button: 'bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
        progress: 'bg-amber-500'
    },
};


export default function Plans() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const totalSubscribers = plans.reduce((sum, plan) => sum + plan.subscribers, 0);
  const totalRevenue = plans.reduce((sum, plan) => sum + plan.revenue, 0);

  return (
    <div className="bg-background text-foreground min-h-screen p-4 lg:p-6 space-y-6">
      
      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">74.2%</p>
              </div>
              <div className="w-8 h-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Churn Rate</p>
                <p className="text-2xl font-bold text-destructive">2.8%</p>
              </div>
              <div className="w-8 h-8 bg-destructive/10 rounded-full flex items-center justify-center">
                 <TrendingUp className="w-4 h-4 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Billing Toggle */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Choose the perfect plan for your hotel business</CardDescription>
            </div>
            <div className="flex items-center space-x-1 bg-muted rounded-lg p-1">
              <Button
                variant={billingCycle === 'monthly' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('monthly')}
                className="text-xs px-3"
              >
                Monthly
              </Button>
              <Button
                variant={billingCycle === 'yearly' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setBillingCycle('yearly')}
                className="text-xs px-3"
              >
                Yearly
                <Badge variant="secondary" className="ml-2 text-xs bg-green-500/20 text-green-700 dark:text-green-300">Save 16%</Badge>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const colors = planColorStyles[plan.color as keyof typeof planColorStyles] || planColorStyles.gray;
              const IconComponent = plan.icon;
              
              return (
                <Card 
                  key={plan.id} 
                  className={`relative flex flex-col border-2 ${plan.popular ? 'border-primary shadow-lg' : colors.border} ${colors.bg}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className={`w-12 h-12 mx-auto rounded-lg bg-background flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                    </div>
                    <CardTitle className={`text-xl ${colors.text}`}>{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className={`text-3xl font-bold ${colors.text}`}>${plan.price[billingCycle]}</span>
                      <span className="text-muted-foreground">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex flex-col flex-grow space-y-4">
                    <div className="space-y-2 flex-grow">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t border-border">
                      <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Subscribers:</span>
                          <span className="font-medium text-foreground">{plan.subscribers}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Monthly Revenue:</span>
                          <span className="font-medium text-foreground">${plan.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className={`w-full mt-auto ${colors.button}`}
                    >
                      {plan.id === 'standard' ? 'Current Plan' : 'Manage Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Subscription Trends</CardTitle>
            <CardDescription>Monthly subscriber growth by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={subscriptionTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Line type="monotone" dataKey="Free" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="Standard" stroke="var(--chart-2)" strokeWidth={2} />
                <Line type="monotone" dataKey="Pro" stroke="var(--chart-3)" strokeWidth={2} />
                <Line type="monotone" dataKey="Enterprise" stroke="var(--chart-4)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
            <CardDescription>Current subscriber breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {planDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>Monthly recurring revenue growth</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
              />
              <Bar dataKey="revenue" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan Performance</CardTitle>
          <CardDescription>Detailed breakdown of each subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plans.map((plan) => {
                 const colors = planColorStyles[plan.color as keyof typeof planColorStyles] || planColorStyles.gray;
                 return (
                    <div key={plan.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                        <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                            <plan.icon className={`w-5 h-5 ${colors.icon}`} />
                        </div>
                        <div>
                            <h4 className={`font-semibold ${colors.text}`}>{plan.name}</h4>
                            <p className="text-sm text-muted-foreground">{plan.subscribers} subscribers</p>
                        </div>
                        </div>
                        <div className="flex items-center space-x-4 sm:space-x-6 w-full sm:w-auto">
                        <div className="text-right flex-grow sm:flex-grow-0">
                            <p className="text-sm text-muted-foreground">Revenue</p>
                            <p className="font-semibold">${plan.revenue.toLocaleString()}</p>
                        </div>
                        <div className="w-32">
                            <Progress 
                                value={(plan.subscribers / totalSubscribers) * 100} 
                                className={`h-2 [&>div]:bg-primary ${colors.progress}`}
                            />
                            <p className="text-xs text-muted-foreground mt-1 text-right">
                                {((plan.subscribers / totalSubscribers) * 100).toFixed(1)}%
                            </p>
                        </div>
                        </div>
                    </div>
                 )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
