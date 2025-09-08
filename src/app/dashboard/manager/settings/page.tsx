"use client"
import { useEffect, useState } from "react";
import {
  User,
  Save,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Shield,
} from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { betterFetch } from "@better-fetch/fetch";
import { supabase } from "@/lib/supabase/client";
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




export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; role: string; image?: string, email?: string , phone?:string} | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

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
      if (!user) {
        toast.error("User not found");
        return;
      }

      setIsUploading(true);

      // Update profile information using staff API
      const res = await fetch("/api/admin/hotel", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: user.id,
          name: profileForm.name,
          email: profileForm.email,
          phone: profileForm.phone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to update profile");
        setIsUploading(false);
        return;
      }

      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        name: profileForm.name, 
        email: profileForm.email,
        phone: profileForm.phone 
      } : prev);

      // Handle photo upload if selected
      let imageUrl: string | null = null;
      if (selectedFile) {
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
        
        const photoRes = await fetch('/api/user/photo', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, imageUrl })
        });
        const photoData = await photoRes.json();
        if (!photoRes.ok) {
          toast.error(photoData.error || 'Failed to save photo');
          setIsUploading(false);
          return;
        }
        
        // Clear local state after successful save
        setSelectedFile(null);
        // Update user state to reflect the new image
        setUser(prev => prev ? { ...prev, image: imageUrl as string } : null);
        // Dispatch custom event to update sidebar photo
        window.dispatchEvent(new CustomEvent('profile-photo-updated'));
        setPreviewUrl(imageUrl);
      }

      setIsUploading(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error('Failed to update profile');
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: session } = await betterFetch<{
          user: { id: string; name: string; role: string; image?: string, email?: string,phone?:string }
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
            image: session.user.image,
            phone: session.user.phone
          }); 
        }

      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    }
  }, [user]);

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


  return (
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account, restaurant, and system preferences</p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 ">
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
                  <div className="space-y-2 flex flex-col gap-2 sm:flex-row sm:gap-2">
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
                        <Button variant="outline" size="sm" className="text-destructive">
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
                  <Button onClick={handleSaveProfile} disabled={isUploading}>
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
                  <Button onClick={handleChangePassword} disabled={isUploading}>
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
        </Tabs>
      </div>

  );
}
