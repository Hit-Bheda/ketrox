"use client"
import { useEffect, useState } from "react";
import {
  User,
  Building2,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Database,
  Download
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
// import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
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
import { betterFetch } from "@better-fetch/fetch";
import { HotelType } from "@/types";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";



export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string, email: string } | null>(null);
  const [hotelsData, setHotelsData] = useState<HotelType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

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
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    owner_name: "",
    address: "",
    owner_phone: "",
  });
  const [systemSettings, setSystemSettings] = useState({
    timezone: "Asia/Kolkata",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12hour",
    currency: "INR",
    language: "en",
    autoBackup: true,
    dataRetention: "365",
    maintenanceMode: false
  });


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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await betterFetch<{
          user: { id: string; name: string; role: string; image?: string, email?: string }
        }>("/api/auth/get-session", {
          baseURL: window.location.origin,
          credentials: "include"
        });

        if (session?.user) {
          setUser({
            id: session.user.id,
            name: session.user.name,
            role: session.user.role,
            email: session.user.email ?? "",
            image: session.user.image
          });
        }


      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();
  }, []);

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
    getHotelsData().then(data => {
      if (data.length > 0) {
        setHotelsData(data[0]);
      }
    });
  }, []);


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

  const handleChangePassword = async () => {
    try {
      if (!profileForm.currentPassword || !profileForm.newPassword || !profileForm.confirmPassword) {
        toast.error("All password fields are required");
        return;
      }

      if (profileForm.newPassword !== profileForm.confirmPassword) {
        toast.error("New passwords do not match");
        return;
      }

      if (profileForm.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters long");
        return;
      }

      setIsUploading(true);

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: profileForm.currentPassword,
          newPassword: profileForm.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to change password");
        setIsUploading(false);
        return;
      }

      // Clear password fields
      setProfileForm(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));

      setIsUploading(false);
      toast.success("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      toast.error("Failed to change password");
      setIsUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update basic profile (except role)
      if (!user) {
        toast.error("User not found");
        return;
      }

      const res = await fetch("/api/super-admin/hotels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hotelsData?.id,
          name: hotelsData?.name,
          logoUrl: hotelsData?.logo_url,
          ownerName: profileForm.name,
          ownerPhone: profileForm.phone,
          address: hotelsData?.address,
          email: profileForm.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        return;
      }

      setUser(prev => prev ? { ...prev, name: profileForm.name, email: profileForm.email } : prev);
      toast.success("Profile updated successfully");

      // Photo upload flow (if any selected)
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
        const sess = await fetch('/api/auth/get-session', { credentials: 'include' });
        const sessJson = await sess.json();
        const uid = sessJson?.user?.id;
        if (!uid) {
          toast.error('User not found');
          setIsUploading(false);
          return;
        }
        const res2 = await fetch('/api/user/photo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: uid, imageUrl })
        });
        const j2 = await res2.json();
        if (!res2.ok) {
          toast.error(j2.error || 'Failed to save photo');
          setIsUploading(false);
          return;
        }
        setSelectedFile(null);
        setIsUploading(false);
        if (imageUrl) {
          setUser(prev => prev ? { ...prev, image: imageUrl as string } : null);
          window.dispatchEvent(new CustomEvent('profile-photo-updated'));
          setPreviewUrl(imageUrl);
        }
      }
    } catch {
      toast.error('Failed to update profile');
      setIsUploading(false);
    }
  };


  // Only set restaurantForm if hotelsData is loaded and form is still at initial state
  useEffect(() => {
    if (hotelsData) {
      setRestaurantForm(prev => {
        const isInitial = !prev.name && !prev.owner_name && !prev.address && !prev.owner_phone;
        if (isInitial) {
          return {
            name: hotelsData.name || "",
            owner_name: hotelsData.owner_name || "",
            address: hotelsData.address || "",
            owner_phone: hotelsData.owner_phone || "",
          };
        }
        return prev;
      });
    }
  }, [hotelsData]);

  // Only set profileForm if user/hotelsData is loaded and form is still at initial state
  useEffect(() => {
    if (user) {
      setProfileForm(prev => {
        const isInitial = !prev.name && !prev.email && !prev.phone;
        if (isInitial) {
          return {
            name: user.name || "",
            email: user.email || "",
            phone: hotelsData?.owner_phone || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
          };
        }
        return prev;
      });
    }
  }, [user, hotelsData]);


  const handleLogoUpload = async () => {
    if (!selectedLogoFile || !hotelsData?.id) {
      toast.error("Please select a logo file");
      return;
    }

    try {
      setIsUploadingLogo(true);

      // Upload to Supabase
      const fileExt = selectedLogoFile.name.split(".").pop();
      const fileName = `logo_${hotelsData.id}_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const supabaseClient = supabase();
      const { error } = await supabaseClient.storage
        .from("mybucket")
        .upload(filePath, selectedLogoFile, { contentType: selectedLogoFile.type });

      if (error) {
        toast.error(error.message || 'Logo upload failed');
        setIsUploadingLogo(false);
        return;
      }

      const { data, error: signedUrlError } = await supabaseClient.storage
        .from("mybucket")
        .createSignedUrl(filePath, 1577880000);

      if (signedUrlError || !data) {
        toast.error(signedUrlError?.message || 'Failed to create signed URL');
        setIsUploadingLogo(false);
        return;
      }

      const logoUrl = data.signedUrl as string;

      // Update hotel with new logo URL
      const res = await fetch("/api/super-admin/hotels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hotelsData.id,
          name: hotelsData.name,
          logoUrl: logoUrl,
          ownerName: hotelsData.owner_name,
          ownerPhone: hotelsData.owner_phone,
          address: hotelsData.address,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Failed to update logo");
        setIsUploadingLogo(false);
        return;
      }

      // Update local state
      setHotelsData(prev => prev ? { ...prev, logo_url: logoUrl } : prev);
      setSelectedLogoFile(null);
      setLogoPreviewUrl(null);
      setIsUploadingLogo(false);

      // Dispatch event to update layout logo
      window.dispatchEvent(new CustomEvent('tenant-logo-updated', { detail: { logoUrl } }));

      toast.success("Logo updated successfully");
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Failed to upload logo");
      setIsUploadingLogo(false);
    }
  };

  const handleSaveRestaurant = async () => {
    try {
      if (!hotelsData?.id) {
        toast.error("Hotel id not found");
        return;
      }
      const res = await fetch("/api/super-admin/hotels", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: hotelsData.id,
          name: restaurantForm.name,
          logoUrl: hotelsData.logo_url,
          ownerName: restaurantForm.owner_name,
          ownerPhone: restaurantForm.owner_phone,
          address: restaurantForm.address,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update restaurant");
        return;
      }

      toast.success("Restaurant updated successfully");
    } catch {
      toast.error("Failed to update restaurant");
    }
  };


  return (

    <div className="flex-1 space-y-6 p-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account, restaurant, and system preferences</p>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
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
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={previewUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <Avatar className="w-20 h-20">
                      <AvatarImage src={user?.image || "/images/user.png"} alt={user?.name} />
                      <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                  )}
                </div>
                <div className="space-y-2 flex flex-col sm:flex-row sm:gap-2">
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
                    <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
                      <span><Upload className="w-4 h-4 mr-2" />Change Photo</span>
                    </Button>
                  </label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto text-destructive">
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
                              if (!user) return;
                              const res = await fetch('/api/user/photo', {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id })
                              });
                              const j = await res.json();
                              if (!res.ok) { toast.error(j.error || 'Failed to remove photo'); return; }
                              // Clear preview and selection
                              setPreviewUrl(null);
                              setSelectedFile(null);
                              // Update user state to reflect the removed image
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
              </div>

              <Separator />

              {/* Profile Form */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="mb-2">Full Name</Label>
                  <Input
                    id="name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-2">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="mb-2">Phone</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="mb-2">Role</Label>
                  <div className="flex items-center h-10 px-3 py-2 border border-input bg-background rounded-md">
                    <Badge variant="secondary">{user?.role}</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Password Change */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="current-password" className="mb-2">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        value={profileForm.currentPassword}
                        onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
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
                    <Label htmlFor="new-password" className="mb-2">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password" className="mb-2">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                <Button onClick={handleSaveProfile} disabled={isUploading} className="w-full sm:w-auto">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
                <Button onClick={handleChangePassword} disabled={isUploading} className="w-full sm:w-auto">
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
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
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-muted overflow-hidden">
                  {logoPreviewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreviewUrl} alt="Logo Preview" className="h-full w-full object-cover" />
                  ) : hotelsData?.logo_url ? (
                    <Image
                      src={hotelsData.logo_url}
                      width={100}
                      height={100}
                      alt={hotelsData?.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                      <Building2 className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex flex-col gap-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setSelectedLogoFile(file);
                        const url = URL.createObjectURL(file);
                        setLogoPreviewUrl(url);
                      }}
                    />
                    <Button asChild variant="outline" size="sm">
                      <span><Upload className="w-4 h-4 mr-2" />Upload Logo</span>
                    </Button>
                  </label>
                  {selectedLogoFile && (
                    <Button
                      onClick={handleLogoUpload}
                      disabled={isUploadingLogo}
                      size="sm"
                      className="w-full"
                    >
                      {isUploadingLogo ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Logo
                        </>
                      )}
                    </Button>
                  )}

                  <p className="text-xs text-muted-foreground">Recommended: 300x300px, PNG or JPG</p>
                </div>
              </div>

              <Separator />

              {/* Restaurant Form */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <Label htmlFor="restaurant-name" className="mb-2">Restaurant Name</Label>
                  <Input
                    type="text"
                    value={restaurantForm.name}

                    onChange={(e) =>
                      setRestaurantForm({ ...restaurantForm, name: e.target.value })
                    }
                  />
                </div>

                {/* Owner Name (editable) */}
                <div>
                  <Label htmlFor="owner-name" className="mb-2">Owner Name</Label>
                  <Input
                    id="owner-name"
                    value={restaurantForm.owner_name || ""}
                    onChange={(e) =>
                      setRestaurantForm({ ...restaurantForm, owner_name: e.target.value })
                    }
                  />
                </div>

                {/* Address (editable) */}
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="mb-2">Address</Label>
                  <Input
                    id="address"
                    value={restaurantForm.address}
                    onChange={(e) =>
                      setRestaurantForm({ ...restaurantForm, address: e.target.value })
                    }
                  />
                </div>

                {/* Phone (editable) */}
                <div>
                  <Label htmlFor="restaurant-phone" className="mb-2">Phone</Label>
                  <Input
                    type="text"
                    value={restaurantForm.owner_phone}
                    onChange={(e) =>
                      setRestaurantForm({ ...restaurantForm, owner_phone: e.target.value })
                    }
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <Label htmlFor="restaurant-email" className="mb-2">Email</Label>
                  <Input
                    id="restaurant-email"
                    type="email"
                    value={hotelsData?.email || ""}
                    readOnly
                  />
                </div>
              </div>


              <div className="flex justify-end">

                <Button onClick={handleSaveRestaurant} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
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
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Customer Messages</Label>
                    <p className="text-sm text-muted-foreground">Notifications for customer inquiries and feedback</p>
                  </div>
                  <Switch
                    checked={notifications.customerMessages}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, customerMessages: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Staff Alerts</Label>
                    <p className="text-sm text-muted-foreground">Important alerts from staff members</p>
                  </div>
                  <Switch
                    checked={notifications.staffAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, staffAlerts: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">Updates about system maintenance and new features</p>
                  </div>
                  <Switch
                    checked={notifications.systemUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
                  </div>
                  <Switch
                    checked={notifications.smsNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Digest</Label>
                    <p className="text-sm text-muted-foreground">Daily summary of restaurant activity</p>
                  </div>
                  <Switch
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
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
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <Label htmlFor="timezone" className="mb-2">Timezone</Label>
                  <Select value={systemSettings.timezone} onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Kolkata">India Standard Time (IST)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="currency" className="mb-2">Currency</Label>
                  <Select value={systemSettings.currency} onValueChange={(value) => setSystemSettings({ ...systemSettings, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-format" className="mb-2">Date Format</Label>
                  <Select value={systemSettings.dateFormat} onValueChange={(value) => setSystemSettings({ ...systemSettings, dateFormat: value })}>
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
                  <Label htmlFor="time-format" className="mb-2">Time Format</Label>
                  <Select value={systemSettings.timeFormat} onValueChange={(value) => setSystemSettings({ ...systemSettings, timeFormat: value })}>
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
                    <Label >Automatic Backup</Label>
                    <p className="text-sm text-muted-foreground">Daily backup of restaurant data</p>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, autoBackup: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenanceMode: checked })}
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

  );
}
