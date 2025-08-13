"use client"

import { useState } from "react";
import { 
  Save, 
  Upload,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
  Key,
  Mail,
  Globe,
  CreditCard,
  Bell,
  Shield,
  Database,
  Copy,
  CheckCircle
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

// Form schemas
const generalSettingsSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  supportEmail: z.string().email("Please enter a valid email address"),
  currency: z.string(),
  timezone: z.string(),
  language: z.string(),
});

const smtpSettingsSchema = z.object({
  host: z.string().min(1, "SMTP host is required"),
  port: z.string().min(1, "Port is required"),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  encryption: z.string(),
  enabled: z.boolean(),
});

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      brandName: "HotelSaaS",
      supportEmail: "support@ketrox.com",
      currency: "USD",
      timezone: "America/New_York",
      language: "en"
    },
  });

  const smtpForm = useForm<z.infer<typeof smtpSettingsSchema>>({
    resolver: zodResolver(smtpSettingsSchema),
    defaultValues: {
      host: "smtp.mailgun.org",
      port: "587",
      username: "noreply@ketrox.com",
      password: "",
      encryption: "TLS",
      enabled: true
    },
  });

  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onGeneralSubmit = (values: z.infer<typeof generalSettingsSchema>) => {
    console.log("General settings:", values);
    toast.success("General settings updated successfully!");
  };

  const onSmtpSubmit = (values: z.infer<typeof smtpSettingsSchema>) => {
    console.log("SMTP settings:", values);
    toast.success("SMTP settings updated successfully!");
  };

  const onSecuritySubmit = (values: z.infer<typeof securitySettingsSchema>) => {
    console.log("Security settings:", values);
    toast.success("Password updated successfully!");
    securityForm.reset();
  };

  const handleGenerateApiKey = () => {
    console.log("Generating new API key");
    toast.success("New API key generated!");
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText("sk_live_1234567890abcdef");
    toast.success("API key copied to clipboard!");
  };

  const handleDeleteAccount = () => {
    console.log("Initiating account deletion");
    toast.error("Account deletion initiated!");
  };

  return (
        <div className="flex-1 space-y-6 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application configuration and preferences
          </p>
        </div>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Application Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure basic application settings and branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <FormField
                        control={generalForm.control}
                        name="brandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Brand Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter brand name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="supportEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Support Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="support@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <FormField
                        control={generalForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Default Currency</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="USD">USD - US Dollar</SelectItem>
                                <SelectItem value="EUR">EUR - Euro</SelectItem>
                                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                                <SelectItem value="America/Chicago">Central Time</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                                <SelectItem value="UTC">UTC</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={generalForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Company Logo</Label>
                      <div className="flex items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                          <span className="text-sm text-muted-foreground">Logo</span>
                        </div>
                        <Button variant="outline" type="button">
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Logo
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 256x256px, PNG or SVG format
                      </p>
                    </div>
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>System Maintenance</span>
                </CardTitle>
                <CardDescription>
                  Control system-wide maintenance settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable access for all users
                    </p>
                  </div>
                  <Switch
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>
                {maintenanceMode && (
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4"> {/* Updated to use shadcn variables */}
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" /> {/* text-yellow-500 */}
                      <span className="font-medium text-yellow-500">Maintenance Mode Active</span> {/* text-yellow-500 */}
                    </div>
                    <p className="mt-1 text-sm text-yellow-500/80"> {/* text-yellow-500/80 */}
                      All users except super admins are currently unable to access the system.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Billing Settings */}
          <TabsContent value="billing">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5" />
                  <span>Current Plan</span>
                </CardTitle>
                <CardDescription>
                  Manage your subscription and billing information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5 p-6"> {/* Updated to use shadcn variables */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-xl font-bold">Enterprise Plan</h3>
                        <Badge>Current</Badge>
                      </div>
                      <p className="text-muted-foreground">$299/month • Unlimited everything</p>
                      <p className="text-sm text-muted-foreground">Next payment: February 15, 2024</p>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                </div>
                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold">Billing History</h4>
                  <div className="space-y-3">
                    {[
                      { date: "Jan 15, 2024", amount: "$299.00", status: "Paid", invoice: "INV-2024-001" },
                      { date: "Dec 15, 2023", amount: "$299.00", status: "Paid", invoice: "INV-2023-012" },
                      { date: "Nov 15, 2023", amount: "$299.00", status: "Paid", invoice: "INV-2023-011" },
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{payment.invoice}</p>
                          <p className="text-sm text-muted-foreground">{payment.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{payment.amount}</p>
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"> {/* Updated to use shadcn variables */}
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Email Settings */}
          <TabsContent value="email">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="w-5 h-5" />
                  <span>SMTP Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure email server settings for system notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...smtpForm}>
                  <form onSubmit={smtpForm.handleSubmit(onSmtpSubmit)} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMTP Email Service</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable/disable email functionality
                        </p>
                      </div>
                      <FormField
                        control={smtpForm.control}
                        name="enabled"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    {smtpForm.watch("enabled") && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={smtpForm.control}
                            name="host"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SMTP Host</FormLabel>
                                <FormControl>
                                  <Input placeholder="smtp.example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={smtpForm.control}
                            name="port"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Port</FormLabel>
                                <FormControl>
                                  <Input placeholder="587" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                          <FormField
                            control={smtpForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                  <Input placeholder="username@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={smtpForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Password" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={smtpForm.control}
                          name="encryption"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Encryption</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select encryption" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="TLS">TLS</SelectItem>
                                  <SelectItem value="SSL">SSL</SelectItem>
                                  <SelectItem value="NONE">None</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-2">
                          <Button type="submit">
                            <Save className="w-4 h-4 mr-2" />
                            Save SMTP Settings
                          </Button>
                          <Button type="button" variant="outline">
                            <Mail className="w-4 h-4 mr-2" />
                            Test Connection
                          </Button>
                        </div>
                      </>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* API & Webhooks */}
          <TabsContent value="api">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>API Keys</span>
                </CardTitle>
                <CardDescription>
                  Manage API keys for integrations and external services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Label>Production API Key</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={showApiKey ? "sk_live_1234567890abcdef" : "sk_live_••••••••••••••••"}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="outline" size="sm" onClick={handleCopyApiKey}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button onClick={handleGenerateApiKey} variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New Key
                </Button>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold">Webhook Endpoints</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">https://api.yourapp.com/webhooks</p>
                        <p className="text-sm text-muted-foreground">Hotel booking events</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"> {/* Updated to use shadcn variables */}
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">Add Webhook</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notifications */}
          <TabsContent value="notifications">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>
                  Configure how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications via email
                        </p>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>SMS Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive urgent notifications via SMS
                        </p>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onCheckedChange={setSmsNotifications}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h4 className="font-semibold">Notification Types</h4>
                    <div className="space-y-3">
                      {[
                        { name: "New hotel registrations", email: true, sms: false },
                        { name: "Payment failures", email: true, sms: true },
                        { name: "System maintenance", email: true, sms: false },
                        { name: "Security alerts", email: true, sms: true },
                        { name: "Monthly reports", email: true, sms: false },
                      ].map((notification, index) => (
                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                          <span className="font-medium">{notification.name}</span>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">Email</span>
                              <Switch checked={notification.email} />
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm">SMS</span>
                              <Switch checked={notification.sms} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
            </Card>
          </TabsContent>
          
          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Security Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage security and access control settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...securityForm}>
                  <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter current password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Confirm new password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">
                      <Save className="w-4 h-4 mr-2" />
                      Update Password
                    </Button>
                  </form>
                </Form>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h4 className="font-semibold">Two-Factor Authentication</h4>
                  <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4"> {/* Updated to use shadcn variables */}
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" /> {/* text-yellow-500 */}
                      <span className="font-medium text-yellow-500">Not Enabled</span> {/* text-yellow-500 */}
                    </div>
                    <p className="mt-1 text-sm text-yellow-500/80"> {/* text-yellow-500/80 */}
                      Enable two-factor authentication for additional security.
                    </p>
                    <Button className="mt-3" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Danger Zone */}
            <Card className="border-destructive/50 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Danger Zone</span>
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-destructive/20 p-4">
                  <h4 className="font-semibold text-destructive mb-2">Delete Account</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Yes, delete account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
