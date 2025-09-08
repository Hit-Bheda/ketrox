"use client"

import { useEffect, useState } from "react";
import {
  Save,
  Upload,
  Trash2,
  AlertTriangle,
  Globe,
  Bell,
  Shield,
  Database,
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
// import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
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
import { supabase } from "@/lib/supabase/client";

// Form schemas
const generalSettingsSchema = z.object({
  brandName: z.string().min(2, "Brand name must be at least 2 characters"),
  supportEmail: z.string().email("Please enter a valid email address"),
  currency: z.string(),
  timezone: z.string(),
  language: z.string(),
});

// const smtpSettingsSchema = z.object({
//   host: z.string().min(1, "SMTP host is required"),
//   port: z.string().min(1, "Port is required"),
//   username: z.string().min(1, "Username is required"),
//   password: z.string().min(1, "Password is required"),
//   encryption: z.string(),
//   enabled: z.boolean(),
// });

const securitySettingsSchema = z.object({
  currentPassword: z.string().min(8, "Password must be at least 8 characters"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string, email?: string , phone?:string} | null>(null);

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: {
      brandName: "KETROX",
      supportEmail: "ketrox083@gmail.com",
      currency: "INR",
      timezone: "Asia/Kolkata",
      language: "en"
    },
  });

  // const smtpForm = useForm<z.infer<typeof smtpSettingsSchema>>({
  //   resolver: zodResolver(smtpSettingsSchema),
  //   defaultValues: {
  //     host: "smtp.mailgun.org",
  //     port: "587",
  //     username: "noreply@ketrox.com",
  //     password: "",
  //     encryption: "TLS",
  //     enabled: true
  //   },
  // });

  const securityForm = useForm<z.infer<typeof securitySettingsSchema>>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Show existing saved image on UI when page loads, keep preview when selecting a new file
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('/api/auth/get-session', { credentials: 'include' });
        const js = await resp.json();
        const existing: string | undefined = js?.user?.image;
        if (!cancelled && existing && !selectedFile) {
          setPreviewUrl(existing);
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedFile]);

  const onSecuritySubmit = async (values: z.infer<typeof securitySettingsSchema>) => {
    try {
      setIsUploading(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        setIsUploading(false);
        return;
      }

      // Reset form
      securityForm.reset();
      setIsUploading(false);
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Failed to change password");
      setIsUploading(false);
    }
  };

  const onGeneralSubmit = async () => {
    try {
      let imageUrl: string | null = null;
      if (selectedFile) {
        setIsUploading(true);
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const supabaseClient = supabase();
        const { error } = await supabaseClient.storage
          .from("mybucket")
          .upload(filePath, selectedFile, { contentType: selectedFile.type });
        if (error) {
          toast.error(error.message || 'Upload failed');
          setIsUploading(false);
          return;
        }
        const { data, error: signedUrlError } = await supabaseClient.storage
          .from("mybucket")
          .createSignedUrl(filePath, 1577880000);
        if (signedUrlError || !data) {
          toast.error(signedUrlError?.message || 'Failed to create signed URL');
          setIsUploading(false);
          return;
        }
        imageUrl = data.signedUrl as string;
        // Get session user id
        const sess = await fetch('/api/auth/get-session', { credentials: 'include' });
        const sessJson = await sess.json();
        const uid = sessJson?.user?.id;
        if (!uid) {
          toast.error('User not found');
          setIsUploading(false);
          return;
        }
        const res = await fetch('/api/user/photo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, imageUrl })
        });
        const j = await res.json();
        if (!res.ok) {
          toast.error(j.error || 'Failed to save photo');
          setIsUploading(false);
          return;
        }
        // Clear local state after successful save
        setSelectedFile(null);
        setIsUploading(false);
        // Dispatch custom event to update sidebar photo
        window.dispatchEvent(new CustomEvent('profile-photo-updated'));
      }
      toast.success('Configuration saved');
      if (imageUrl) {
        setPreviewUrl(imageUrl);
      }
    } catch {
      toast.error('Failed to save configuration');
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="max-w-full mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application configuration and preferences
          </p>
        </div>
        <Tabs defaultValue="general" className="space-y-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            {/* <TabsTrigger value="email">Email</TabsTrigger> */}
            {/* <TabsTrigger value="api">API</TabsTrigger> */}
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
                            <Select
                              onValueChange={field.onChange}
                              value={field.value || "USD"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="INR">INR - Indian Rupee</SelectItem>
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
                                <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
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
                      <Label>profile Logo</Label>
                      <div className="flex flex-col sm:flex-row gap-y-4 items-center space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted overflow-hidden">
                          {previewUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-sm text-muted-foreground">Logo</span>
                          )}
                        </div>
                        <label className="inline-flex">
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setSelectedFile(file);
                              const url = URL.createObjectURL(file);
                              setPreviewUrl(url);
                            }}
                          />
                          <Button asChild variant="outline" type="button" size="sm" className="w-full sm:w-auto">
                            <span><Upload className="w-4 h-4 mr-2" />Upload Profile photo</span>
                          </Button>
                        </label>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm"  className="text-destructive w-full sm:w-auto">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will remove your current profile photo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  try {
                                    const sess = await fetch('/api/auth/get-session', { credentials: 'include' });
                                    const sessJson = await sess.json();
                                    const uid = sessJson?.user?.id;
                                    if (!uid) { toast.error('User not found'); return; }
                                    const res = await fetch('/api/user/photo', {
                                      method: 'DELETE',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ userId: uid })
                                    });
                                    const j = await res.json();
                                    if (!res.ok) { toast.error(j.error || 'Failed to remove photo'); return; }
                                    // Clear preview and selection
                                    setPreviewUrl(null);
                                    setSelectedFile(null);
                                    setUser(prev => prev ? { ...prev, image: undefined } : null);
                                    // Dispatch custom event to update sidebar photo
                                    window.dispatchEvent(new CustomEvent('profile-photo-updated'));
                                    toast.success('Photo removed');
                                  } catch {
                                    toast.error('Unexpected error');
                                  }
                                }}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recommended: 256x256px, PNG or SVG format
                      </p>
                    </div>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Configuration
                        </>
                      )}
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


          {/* Email Settings */}
          {/* <TabsContent value="email">
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
          </TabsContent> */}

          {/* API & Webhooks */}
          {/* <TabsContent value="api">
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
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20"> 
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline">Add Webhook</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

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
                      <div key={index} className="md:flex  items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">{notification.name}</span>
                        <div className="flex items-center  mt-1 space-x-4">
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
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Updating Password...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>

              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
