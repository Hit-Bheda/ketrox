"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  ChefHat,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Copy,
  ExternalLink,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
// import { Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import AddMenuModal from "@/components/menu/add-menu-modal";

import EditMenuModal from "@/components/menu/edit-menu-modal";
import { toast } from "sonner";
import { MenuImageSlider } from "@/components/menu/MenuImageSlider";


import { DescriptionPopover } from "@/components/menu/DescriptionPopover";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ApiMenuItem, DietaryOption, MenuItem } from "@/types";



export default function Menu() {

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [viewOpen, setViewOpen] = useState(false);
  const [itemForm, setItemForm] = useState<MenuItem>({
    id: "",
    name: "",
    category: "",
    description: "",
    price: "",
    preparationTime: "",
    dietary: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    available: true,
    image: [],
  });


  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesAvailability = availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.available) ||
      (availabilityFilter === "unavailable" && !item.available);

    return matchesSearch && matchesCategory && matchesAvailability;
  });


  const badgeColors: Record<DietaryOption, string> = {
    vegetarian: "bg-emerald-700 text-white",
    vegan: "bg-indigo-700 text-white",
    glutenFree: "bg-amber-700 text-white",
  };

  const getDietaryBadges = (item: MenuItem) => {
    if (!item.dietary || !Array.isArray(item.dietary)) return null;

    return item.dietary.map((diet) => (
      <Badge key={diet} className={`${badgeColors[diet]} px-2 py-0.5 rounded-full text-xs font-medium`}>
        {diet.charAt(0).toUpperCase() + diet.slice(1)}
      </Badge>

    ));
  };
  const handleAddItem = () => {
    setShowAddModal(false);
    resetForm();
  };


  const featchhMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      const mappedMenu: MenuItem[] = (data.menu || []).map((item: ApiMenuItem) => ({
        id: String(item.id),
        name: item.item_name || item.name || "",
        category: item.category,
        description: item.description,
        price: Number(item.price),
        image: item.item_logo || [],
        preparationTime: Number(item.prepTime || item.preparationTime || 0),
        dietary: (item.dietaty || item.dietary || []) as DietaryOption[],
        isVegetarian: (item.dietaty || item.dietary || []).includes("vegetarian"),
        isVegan: (item.dietaty || item.dietary || []).includes("vegan"),
        isGlutenFree: (item.dietaty || item.dietary || []).includes("glutenFree"),
        available: item.isAvailable ?? true,
      }));
      setMenuItems(mappedMenu);

    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    featchhMenuItems();
    // Load QR code for tenant on mount
    const tenantId = getCookie("tenantId");
    if (tenantId) {
      fetch(`/api/qr?tenantId=${tenantId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.qr?.qrPath) {
            setQrCodeUrl(data.qr.qrPath);
          }
        });
    }
  }, []);


  const handleToggleAvailability = async (itemId: string, currentAvailable: boolean) => {
    try {
      const response = await fetch("/api/admin/menu", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: itemId, isAvailable: !currentAvailable }),
      });
      const data = await response.json();
      if (response.ok) {
        // Optionally show a toast here
        toast.success(data.message);
        // Refresh menu items
        featchhMenuItems();
      } else {

        console.error(data.error || "Failed to update availability");
      }
    } catch (err) {
      console.error(err, "error");
    }
  };

  const uniqueCategories = Array.from(
    new Set(menuItems.map(item => item.category).filter(Boolean))
  );

  const categoryStats = uniqueCategories.map(category => ({
    id: category,
    name: category,
    count: menuItems.filter(item => item.category === category).length,
    available: menuItems.filter(item => item.category === category && item.available).length,
  }));

  const resetForm = () => {
    setItemForm({
      id: "",
      name: "",
      category: "",
      description: "",
      price: "",
      preparationTime: "",
      dietary: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      available: true

    });
    setSelectedItem(null);
  };


  const deleteMenuItem = async (
    id: string,
    onSuccess: () => void,
    onFinish: () => void
  ) => {
    try {
      const response = await fetch("/api/admin/menu", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Menu item deleted");
        onSuccess();
      } else {
        toast.error(data.error || "Failed to delete menu item");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      onFinish();
    }
  };

  const totalStats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.available).length,
    avgPrice: menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + Number(item.price), 0) / menuItems.length : 0,
    topRated: menuItems.length > 0 ? menuItems[0] : { popularity: 0, name: "" }
  };

  function getCookie(name: string) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
    return "";
  }

  const handleGenerateQr = async () => {
    try {
      setLoading(true);
      const tenantId = getCookie("tenantId");
      if (!tenantId) {
        toast.error("Tenant ID not found. Please login again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          url: "/users",
        }),
      });

      const data = await res.json();
      if (res.ok && data.qrPath) {
        setQrCodeUrl(data.qrPath);
        toast.success(data.message || "QR generated successfully");
      } else {
        toast.error(data.message || "Failed to generate QR");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQr = async () => {
    try {
      setLoading(true);
      const tenantId = getCookie("tenantId");
      if (!tenantId) {
        toast.error("Tenant ID not found. Please login again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          url: "/users",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.qrPath) {
        setQrCodeUrl(data.qrPath);
        toast.success(data.message || "QR code updated successfully");
      } else {
        toast.error(data.message || "Failed to update QR code");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQr = async () => {
    try {
      setLoading(true);
      const tenantId = getCookie("tenantId");
      if (!tenantId) {
        toast.error("Tenant ID not found. Please login again.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/qr", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setQrCodeUrl(null);
        toast.success(data.message || "QR code deleted successfully");
      } else {
        toast.error(data.error || "Failed to delete QR code");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleViewQr = () => {
    if (!qrCodeUrl) {
      toast.error("No QR code available to view");
      return;
    }
    setViewOpen(true);
  };

  const handleDownload = () => {
    if (!qrCodeUrl) {
      toast.error("No QR code available to download");
      return;
    }
    fetch(qrCodeUrl)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "menu-QR.png";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        toast.success("QR code downloaded successfully");
      })
      .catch(() => {
        toast.error("Failed to download QR code");
      });
  };

  const handleCopy = async () => {
    if (!qrCodeUrl) {
      toast.error("No QR code available to copy");
      return;
    }
    await navigator.clipboard.writeText(qrCodeUrl);
    toast.success("QR link copied to clipboard");
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
        {/* QR Code for Full Menu */}
        <Card className="hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu QR Code</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR code preview */}
              <div className="flex items-center justify-center w-36 h-36 bg-muted rounded-lg border border-muted-foreground">
                {loading ? (
                  <span className="text-xs text-muted-foreground animate-pulse">Refreshing...</span>
                ) : qrCodeUrl ? (
                  <Image
                    src={qrCodeUrl}
                    alt="QR Code"
                    width={200}
                    height={200}
                    style={{ objectFit: "contain" }}
                    className="w-full h-full"
                    priority
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">QR Code Preview</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="font-medium text-sm">Scan to view the full menu</div>
                <div className="flex gap-2 flex-wrap">
                  {!qrCodeUrl && (
                    <Button
                      onClick={handleGenerateQr}
                      disabled={loading}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      {loading ? "Generating..." : "Generate QR"}
                    </Button>
                  )}
                  <Button
                    onClick={handleUpdateQr}
                    variant="outline"
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                    disabled={!qrCodeUrl || loading}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Update QR
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={!qrCodeUrl || loading}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete QR
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete QR Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. The QR code will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={loading}
                          onClick={handleDeleteQr}
                          className="bg-red-600 text-white hover:bg-red-700"
                        >
                          {loading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                    <DialogContent className="sm:max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <DialogTitle className="text-base font-medium">QR Code</DialogTitle>
                      </div>
                      <div className="flex items-center justify-center">
                        {qrCodeUrl && (
                          <Image
                            src={qrCodeUrl}
                            alt="QR Code"
                            width={300}
                            height={300}
                            className="rounded-lg border"
                          />
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    onClick={handleViewQr}
                    variant="outline"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white"
                    disabled={!qrCodeUrl}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View QR Code
                  </Button>
                  <Button onClick={handleCopy} variant="outline" size="sm" className="bg-purple-600 hover:bg-purple-700 text-white hover:text-white" disabled={!qrCodeUrl}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy/Share Link
                  </Button>
                  <Button onClick={handleDownload} variant="outline" size="sm" className="bg-gray-600 hover:bg-gray-700 text-white hover:text-white" disabled={!qrCodeUrl}>
                    <Download className="w-4 h-4 mr-1" />
                    Download QR
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  You can print or share this QR code for customers to access your menu online.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStats.totalItems}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                <CheckCircle className="w-3 h-3 text-chart-3" />
                <span>{totalStats.availableItems} available</span>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Price</CardTitle>
              <DollarSign className="h-4 w-4 text-chart-2" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-2">${totalStats.avgPrice.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Across all categories
              </div>
            </CardContent>
          </Card>
          {/* 
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
              <Star className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>

              <div className="text-xs text-muted-foreground mt-1">
                {totalStats.topRated.name}
              </div>
            </CardContent>
          </Card> */}

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueCategories.length}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Menu categories
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Categories Overview</CardTitle>
            <CardDescription>Quick view of menu categories and their item counts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {categoryStats.map((category) => (
                <Card
                  key={category.id}
                  className="hover:shadow-md transition-all duration-300 cursor-pointer border-1"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="p-4 text-center">
                    {/* Optionally, you can show a generic icon or the first letter */}
                    <div className="w-8 h-8 mx-auto mb-2 flex items-center justify-center rounded-full bg-muted text-lg font-bold text-primary">
                      {category.name.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    <div className="text-xs text-muted-foreground">
                      {category.available}/{category.count} available
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
        {/* Menu Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Menu Items</CardTitle>
                <CardDescription>Manage your restaurant&apos;s menu items and pricing</CardDescription>
              </div>
              <Button className="hover:scale-105  transition-transform" onClick={() => setShowAddModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Menu Item
              </Button>

            </div>
            <AddMenuModal
              open={showAddModal}
              setOpen={setShowAddModal}
              itemForm={itemForm}
              setItemForm={setItemForm}
              menuCategories={uniqueCategories.map(c => ({ id: c, name: c }))}
              handleAddItem={handleAddItem}
              onSave={featchhMenuItems}
            />
          </CardHeader>

          <CardContent>
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search menu items..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Availability" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="unavailable">Unavailable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Menu Items Grid */}
            {uniqueCategories.map((category) => {
              const itemsInCategory = filteredMenuItems.filter((item) => item.category === category);
              if (itemsInCategory.length === 0) return null;
              return (
                <div key={category} className="mb-8">
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span>{category}</span>
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {itemsInCategory.map((item) => (
                      <Card 
                        key={item.id} 
                        className={`hover:shadow-lg transition-all py-0 duration-300 border-1 ${!item.available ? 'opacity-60' : ''} ${selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="relative rounded-t-xl overflow-hidden">
                          {/* Image */}

                          <MenuImageSlider images={item.image || []} alt={item.name} />
                          {/* Action Menu (Top Right) */}
                          <div className="absolute top-2 right-2 z-10">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8 w-8 p-0 rounded-full bg-[#b91c1c]  shadow">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setItemForm({
                                      id: String(item.id),
                                      name: item.name || "",
                                      category: item.category,
                                      description: item.description,
                                      price: item.price,
                                      preparationTime: item.preparationTime,
                                      dietary: item.dietary || [],
                                      isVegetarian: item.dietary?.includes("vegetarian") || false,
                                      isVegan: item.dietary?.includes("vegan") || false,
                                      isGlutenFree: item.dietary?.includes("glutenFree") || false,
                                      available: item.available,
                                      image: item.image || [],
                                    });
                                    setShowEditModal(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Item
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleToggleAvailability(item.id, item.available)}>
                                  {item.available ? (
                                    <>
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Mark Unavailable
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark Available
                                    </>
                                  )}
                                </DropdownMenuItem>
                              
                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        setDeleteTargetId(item.id);
                                        setDeleteDialogOpen(true);
                                      }}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Delete Item
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Delete <span className="font-bold text-destructive">{item.name}</span>?
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. <br />
                                        <b>{item.name}</b> will be permanently removed from your menu and will no longer be available to customers.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        disabled={deleteLoading}
                                        onClick={() => {
                                          if (!deleteTargetId) return;
                                          setDeleteLoading(true);

                                          deleteMenuItem(
                                            deleteTargetId,
                                            () => featchhMenuItems(),
                                            () => {
                                              setDeleteLoading(false);
                                              setDeleteDialogOpen(false);
                                              setDeleteTargetId(null);
                                            }
                                          );
                                        }}
                                        className="bg-red-600 text-white hover:bg-red-700"
                                      >
                                        {deleteLoading ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {/* Overlay for Unavailable Items */}
                          {!item.available && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-xl">
                              <Badge variant="destructive" className="px-3 py-1 text-xs font-medium">
                                <XCircle className="w-3 h-3 mr-1" />
                                Unavailable
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <CardContent className="p-4 pt-0">
                          <div className="space-y-3">
                            <h3 className="font-semibold text-base">{item.name}</h3>
                            <p className="text-xl font-bold text-primary">${item.price}</p>

                            <DescriptionPopover description={item.description} />

                            <div className="flex flex-wrap gap-1 mt-2">
                              {getDietaryBadges(item)}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground mt-2">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{item.preparationTime}min</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredMenuItems.length === 0 && (
              <div className="text-center py-8">
                <ChefHat className="w-12 h-12 text-muted mx-auto mb-4" />
                <p className="text-muted-foreground">No menu items found matching your criteria.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                    setAvailabilityFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Menu Modal */}
        <EditMenuModal
          open={showEditModal}
          setOpen={setShowEditModal}
          itemForm={itemForm}
          setItemForm={setItemForm}
          menuCategories={uniqueCategories.map(c => ({ id: c, name: c }))}
          onSave={featchhMenuItems}
        />
      </div>
    </>
  );
}
