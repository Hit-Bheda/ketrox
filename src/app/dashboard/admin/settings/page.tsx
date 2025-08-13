"use client"
import { useState } from "react";
import { 
  User, 
  Building2, 
  Palette, 
  Bell, 
  Shield, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Trash2,
  Moon,
  Sun,
  Monitor,
  Database,
  Download
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

// User profile data
const userProfile = {
  name: "John Mitchell",
  email: "john.mitchell@restaurant.com",
  role: "Restaurant Manager",
  phone: "+1 (555) 123-4567",
  avatar: "/api/placeholder/100/100",
  lastLogin: "2024-01-15 14:30:00"
};

// Restaurant settings data
const restaurantSettings = {
  name: "The Gourmet Haven",
  description: "Fine dining experience with contemporary cuisine",
  address: "123 Restaurant Street, City, State 12345",
  phone: "+1 (555) 987-6543",
  email: "info@gourmethaven.com",
  website: "www.gourmethaven.com",
  cuisine: "Contemporary",
  priceRange: "$$$",
  capacity: 120,
  logo: "/api/placeholder/150/150"
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    newOrders: true,
    customerMessages: true,
    staffAlerts: true,
    systemUpdates: false,
    marketingEmails: false,
    smsNotifications: true,
    emailDigest: true,
    pushNotifications: true
  });

  const [profileForm, setProfileForm] = useState({
    name: userProfile.name,
    email: userProfile.email,
    phone: userProfile.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: restaurantSettings.name,
    description: restaurantSettings.description,
    address: restaurantSettings.address,
    phone: restaurantSettings.phone,
    email: restaurantSettings.email,
    website: restaurantSettings.website,
    cuisine: restaurantSettings.cuisine,
    priceRange: restaurantSettings.priceRange,
    capacity: restaurantSettings.capacity
  });

  const [systemSettings, setSystemSettings] = useState({
    timezone: "America/New_York",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12hour",
    currency: "USD",
    language: "en",
    autoBackup: true,
    dataRetention: "365",
    maintenanceMode: false
  });

  const handleSaveProfile = () => {
    console.log("Saving profile:", profileForm);
    // In a real app, this would save to backend
  };

  const handleSaveRestaurant = () => {
    console.log("Saving restaurant settings:", restaurantForm);
    // In a real app, this would save to backend
  };

  const handleSaveNotifications = () => {
    console.log("Saving notification settings:", notifications);
    // In a real app, this would save to backend
  };

  const handleSaveSystem = () => {
    console.log("Saving system settings:", systemSettings);
    // In a real app, this would save to backend
  };

  const exportData = () => {
    console.log("Exporting restaurant data...");
    // In a real app, this would generate and download data export
  };

  const runBackup = () => {
    console.log("Running manual backup...");
    // In a real app, this would trigger backup process
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account, restaurant, and system preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>Update your personal information and account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                    <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Photo
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                      <Badge variant="secondary">{userProfile.role}</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Password Change */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPassword ? "text" : "password"}
                          value={profileForm.currentPassword}
                          onChange={(e) => setProfileForm({...profileForm, currentPassword: e.target.value})}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        value={profileForm.newPassword}
                        onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={profileForm.confirmPassword}
                        onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurant Settings */}
          <TabsContent value="restaurant" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5" />
                  <span>Restaurant Information</span>
                </CardTitle>
                <CardDescription>Configure your restaurant details and business information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground">Recommended: 300x300px, PNG or JPG</p>
                  </div>
                </div>

                <Separator />

                {/* Restaurant Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="restaurant-name">Restaurant Name</Label>
                    <Input
                      id="restaurant-name"
                      value={restaurantForm.name}
                      onChange={(e) => setRestaurantForm({...restaurantForm, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cuisine-type">Cuisine Type</Label>
                    <Select value={restaurantForm.cuisine} onValueChange={(value) => setRestaurantForm({...restaurantForm, cuisine: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Contemporary">Contemporary</SelectItem>
                        <SelectItem value="Italian">Italian</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="Asian">Asian</SelectItem>
                        <SelectItem value="Mexican">Mexican</SelectItem>
                        <SelectItem value="American">American</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={restaurantForm.description}
                      onChange={(e) => setRestaurantForm({...restaurantForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={restaurantForm.address}
                      onChange={(e) => setRestaurantForm({...restaurantForm, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant-phone">Phone</Label>
                    <Input
                      id="restaurant-phone"
                      value={restaurantForm.phone}
                      onChange={(e) => setRestaurantForm({...restaurantForm, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="restaurant-email">Email</Label>
                    <Input
                      id="restaurant-email"
                      type="email"
                      value={restaurantForm.email}
                      onChange={(e) => setRestaurantForm({...restaurantForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={restaurantForm.website}
                      onChange={(e) => setRestaurantForm({...restaurantForm, website: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price-range">Price Range</Label>
                    <Select value={restaurantForm.priceRange} onValueChange={(value) => setRestaurantForm({...restaurantForm, priceRange: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="$">$ (Under $15)</SelectItem>
                        <SelectItem value="$$">$$ ($15-30)</SelectItem>
                        <SelectItem value="$$$">$$$ ($30-50)</SelectItem>
                        <SelectItem value="$$$$">$$$$ (Over $50)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveRestaurant}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="w-5 h-5" />
                  <span>Notification Preferences</span>
                </CardTitle>
                <CardDescription>Manage how you receive alerts and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>New Orders</Label>
                      <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                    </div>
                    <Switch
                      checked={notifications.newOrders}
                      onCheckedChange={(checked) => setNotifications({...notifications, newOrders: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Customer Messages</Label>
                      <p className="text-sm text-muted-foreground">Notifications for customer inquiries and feedback</p>
                    </div>
                    <Switch
                      checked={notifications.customerMessages}
                      onCheckedChange={(checked) => setNotifications({...notifications, customerMessages: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Staff Alerts</Label>
                      <p className="text-sm text-muted-foreground">Important alerts from staff members</p>
                    </div>
                    <Switch
                      checked={notifications.staffAlerts}
                      onCheckedChange={(checked) => setNotifications({...notifications, staffAlerts: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates about system maintenance and new features</p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                    </div>
                    <Switch
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({...notifications, smsNotifications: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Email Digest</Label>
                      <p className="text-sm text-muted-foreground">Daily summary of restaurant activity</p>
                    </div>
                    <Switch
                      checked={notifications.emailDigest}
                      onCheckedChange={(checked) => setNotifications({...notifications, emailDigest: checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotifications}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="w-5 h-5" />
                  <span>Appearance & Theme</span>
                </CardTitle>
                <CardDescription>Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base">Theme Mode</Label>
                    <p className="text-sm text-muted-foreground mb-3">Choose your preferred color scheme</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Sun className="w-6 h-6" />
                        <span>Light</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Moon className="w-6 h-6" />
                        <span>Dark</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col space-y-2">
                        <Monitor className="w-6 h-6" />
                        <span>System</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base">Sidebar Density</Label>
                    <p className="text-sm text-muted-foreground mb-3">Adjust navigation spacing</p>
                    <Select defaultValue="comfortable">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="comfortable">Comfortable</SelectItem>
                        <SelectItem value="spacious">Spacious</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base">Color Scheme</Label>
                    <p className="text-sm text-muted-foreground mb-3">Primary color for accents and highlights</p>
                    <div className="flex space-x-2">
                      {['blue', 'green', 'purple', 'orange', 'red'].map((color) => (
                        <div
                          key={color}
                          className={`w-8 h-8 rounded-full cursor-pointer border-2 border-muted-foreground bg-chart-${['blue', 'green', 'purple', 'orange', 'red'].indexOf(color) + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>System Configuration</span>
                </CardTitle>
                <CardDescription>Configure system settings and data management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({...systemSettings, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD ($)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="CAD">CAD (C$)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date-format">Date Format</Label>
                    <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time-format">Time Format</Label>
                    <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings({...systemSettings, timeFormat: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12hour">12 Hour</SelectItem>
                        <SelectItem value="24hour">24 Hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Daily backup of restaurant data</p>
                    </div>
                    <Switch
                      checked={systemSettings.autoBackup}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Maintenance Mode</Label>
                      <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                    </div>
                    <Switch
                      checked={systemSettings.maintenanceMode}
                      onCheckedChange={(checked) => setSystemSettings({...systemSettings, maintenanceMode: checked})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Management</h3>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={exportData}>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                    <Button variant="outline" onClick={runBackup}>
                      <Database className="w-4 h-4 mr-2" />
                      Run Backup
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear Cache
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Clear Cache</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will clear all cached data. The system may be slower while it rebuilds the cache.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Clear Cache</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSystem}>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
