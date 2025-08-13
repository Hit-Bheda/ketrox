"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  Star,
  DollarSign,
  ChefHat,
  Coffee,
  UtensilsCrossed,
  Wine,
  IceCream,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image,
} from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

// Realistic menu data with categories
const menuCategories = [
  { id: "appetizers", name: "Appetizers", icon: UtensilsCrossed, color: "text-chart-1" },
  { id: "mains", name: "Main Courses", icon: ChefHat, color: "text-chart-2" },
  { id: "desserts", name: "Desserts", icon: IceCream, color: "text-chart-3" },
  { id: "beverages", name: "Beverages", icon: Coffee, color: "text-chart-4" },
  { id: "wines", name: "Wines & Spirits", icon: Wine, color: "text-chart-5" }
];

const menuData = [
  // Appetizers
  {
    id: 1,
    name: "Truffle Burrata",
    category: "appetizers",
    description: "Fresh burrata with black truffle shavings, arugula, and aged balsamic",
    price: 18.00,
    image: "/api/placeholder/300/200",
    preparationTime: 10,
    allergens: ["dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.8,
    orderCount: 142
  },
  {
    id: 2,
    name: "Seared Scallops",
    category: "appetizers", 
    description: "Pan-seared scallops with cauliflower purée and pancetta crisps",
    price: 24.00,
    image: "/api/placeholder/300/200",
    preparationTime: 15,
    allergens: ["shellfish"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.9,
    orderCount: 89
  },
  {
    id: 3,
    name: "Wagyu Beef Carpaccio",
    category: "appetizers",
    description: "Thinly sliced wagyu with wild mushrooms, aged parmesan, and lemon oil",
    price: 32.00,
    image: "/api/placeholder/300/200",
    preparationTime: 12,
    allergens: ["dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    available: false,
    popularity: 4.7,
    orderCount: 67
  },
  
  // Main Courses
  {
    id: 4,
    name: "Dry-Aged Ribeye",
    category: "mains",
    description: "28-day dry-aged ribeye with roasted bone marrow and seasonal vegetables",
    price: 65.00,
    image: "/api/placeholder/300/200",
    preparationTime: 25,
    allergens: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.9,
    orderCount: 156
  },
  {
    id: 5,
    name: "Chilean Sea Bass",
    category: "mains",
    description: "Miso-glazed Chilean sea bass with forbidden rice and bok choy",
    price: 42.00,
    image: "/api/placeholder/300/200",
    preparationTime: 20,
    allergens: ["fish", "soy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    available: true,
    popularity: 4.6,
    orderCount: 98
  },
  {
    id: 6,
    name: "Lobster Risotto",
    category: "mains",
    description: "Maine lobster risotto with saffron, peas, and microgreens",
    price: 48.00,
    image: "/api/placeholder/300/200",
    preparationTime: 22,
    allergens: ["shellfish", "dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.8,
    orderCount: 134
  },
  
  // Desserts
  {
    id: 7,
    name: "Chocolate Soufflé",
    category: "desserts",
    description: "Dark chocolate soufflé with vanilla bean ice cream and gold leaf",
    price: 16.00,
    image: "/api/placeholder/300/200",
    preparationTime: 18,
    allergens: ["dairy", "eggs"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    available: true,
    popularity: 4.7,
    orderCount: 178
  },
  {
    id: 8,
    name: "Tiramisu",
    category: "desserts",
    description: "Classic tiramisu with espresso-soaked ladyfingers and mascarpone",
    price: 12.00,
    image: "/api/placeholder/300/200",
    preparationTime: 5,
    allergens: ["dairy", "eggs"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    available: true,
    popularity: 4.5,
    orderCount: 203
  },
  
  // Beverages
  {
    id: 9,
    name: "Craft Cold Brew",
    category: "beverages",
    description: "House-made cold brew with vanilla simple syrup and oat milk foam",
    price: 6.50,
    image: "/api/placeholder/300/200",
    preparationTime: 3,
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    available: true,
    popularity: 4.4,
    orderCount: 312
  },
  {
    id: 10,
    name: "Artisan Hot Chocolate",
    category: "beverages",
    description: "Belgian dark chocolate with house-made marshmallows and cinnamon",
    price: 8.00,
    image: "/api/placeholder/300/200",
    preparationTime: 5,
    allergens: ["dairy"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.6,
    orderCount: 145
  },
  
  // Wines
  {
    id: 11,
    name: "Châteauneuf-du-Pape 2018",
    category: "wines",
    description: "Full-bodied red wine with notes of dark fruit and spices",
    price: 85.00,
    image: "/api/placeholder/300/200",
    preparationTime: 2,
    allergens: ["sulfites"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.8,
    orderCount: 45
  },
  {
    id: 12,
    name: "Champagne Dom Pérignon",
    category: "wines",
    description: "Vintage champagne with elegant bubbles and complex flavor profile",
    price: 280.00,
    image: "/api/placeholder/300/200",
    preparationTime: 2,
    allergens: ["sulfites"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: true,
    available: true,
    popularity: 4.9,
    orderCount: 23
  }
];

export default function Menu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof menuData[0] | null>(null);
  
  // Form state for add/edit modal
  const [itemForm, setItemForm] = useState({
    name: "",
    category: "appetizers",
    description: "",
    price: 0,
    preparationTime: 10,
    allergens: [] as string[],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    available: true
  });

  const filteredMenuItems = menuData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesAvailability = availabilityFilter === "all" || 
                               (availabilityFilter === "available" && item.available) ||
                               (availabilityFilter === "unavailable" && !item.available);
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const getAllergenBadge = (allergens: string[]) => {
    if (allergens.length === 0) return null;
    return (
      <Badge variant="outline" className="text-xs">
        <AlertCircle className="w-3 h-3 mr-1" />
        {allergens.length} allergen{allergens.length > 1 ? 's' : ''}
      </Badge>
    );
  };

  const getDietaryBadges = (item: typeof menuData[0]) => {
    const badges = [];
    if (item.isVegan) badges.push(<Badge key="vegan" className="bg-chart-3 text-foreground text-xs">Vegan</Badge>);
    else if (item.isVegetarian) badges.push(<Badge key="vegetarian" className="bg-chart-4 text-foreground text-xs">Vegetarian</Badge>);
    if (item.isGlutenFree) badges.push(<Badge key="gf" className="bg-chart-5 text-foreground text-xs">GF</Badge>);
    return badges;
  };

  const handleAddItem = () => {
    console.log("Adding menu item:", itemForm);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditItem = (item: typeof menuData[0]) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      preparationTime: item.preparationTime,
      allergens: item.allergens,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      available: item.available
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = () => {
    console.log("Updating menu item:", selectedItem?.id, itemForm);
    setShowEditModal(false);
    resetForm();
  };

  const resetForm = () => {
    setItemForm({
      name: "",
      category: "appetizers",
      description: "",
      price: 0,
      preparationTime: 10,
      allergens: [],
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      available: true
    });
    setSelectedItem(null);
  };

  const toggleAvailability = (itemId: number) => {
    console.log(`Toggling availability for item ${itemId}`);
  };

  const deleteItem = (itemId: number) => {
    console.log(`Deleting item ${itemId}`);
  };

  const categoryStats = menuCategories.map(category => ({
    ...category,
    count: menuData.filter(item => item.category === category.id).length,
    available: menuData.filter(item => item.category === category.id && item.available).length
  }));

  const totalStats = {
    totalItems: menuData.length,
    availableItems: menuData.filter(item => item.available).length,
    avgPrice: menuData.reduce((sum, item) => sum + item.price, 0) / menuData.length,
    topRated: menuData.reduce((max, item) => item.popularity > max.popularity ? item : max, menuData[0])
  };

  return (
    <>
      <div className="flex-1 space-y-6 p-6 animate-fadeIn">
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

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Rated</CardTitle>
              <Star className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{totalStats.topRated.popularity}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {totalStats.topRated.name}
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{menuCategories.length}</div>
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
              {categoryStats.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="hover:shadow-md transition-all duration-300 cursor-pointer"
                        onClick={() => setSelectedCategory(category.id)}>
                    <CardContent className="p-4 text-center">
                      <IconComponent className={`w-8 h-8 mx-auto mb-2 ${category.color}`} />
                      <h3 className="font-medium text-sm">{category.name}</h3>
                      <div className="text-xs text-muted-foreground">
                        {category.available}/{category.count} available
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button className="hover:scale-105 transition-transform">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                    <DialogDescription>
                      Create a new menu item with all details and specifications.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="item-name">Item Name</Label>
                        <Input
                          id="item-name"
                          value={itemForm.name}
                          onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                          placeholder="Truffle Pasta"
                        />
                      </div>
                      <div>
                        <Label htmlFor="item-category">Category</Label>
                        <Select value={itemForm.category} onValueChange={(value) => setItemForm({...itemForm, category: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {menuCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="item-description">Description</Label>
                      <Textarea
                        id="item-description"
                        value={itemForm.description}
                        onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                        placeholder="Detailed description of the dish..."
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="item-price">Price ($)</Label>
                        <Input
                          id="item-price"
                          type="number"
                          step="0.01"
                          value={itemForm.price}
                          onChange={(e) => setItemForm({...itemForm, price: parseFloat(e.target.value)})}
                          placeholder="24.99"
                        />
                      </div>
                      <div>
                        <Label htmlFor="prep-time">Prep Time (minutes)</Label>
                        <Input
                          id="prep-time"
                          type="number"
                          value={itemForm.preparationTime}
                          onChange={(e) => setItemForm({...itemForm, preparationTime: parseInt(e.target.value)})}
                          placeholder="15"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Dietary Options</Label>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="vegetarian"
                            checked={itemForm.isVegetarian}
                            onCheckedChange={(checked) => setItemForm({...itemForm, isVegetarian: checked})}
                          />
                          <Label htmlFor="vegetarian">Vegetarian</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="vegan"
                            checked={itemForm.isVegan}
                            onCheckedChange={(checked) => setItemForm({...itemForm, isVegan: checked})}
                          />
                          <Label htmlFor="vegan">Vegan</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="gluten-free"
                            checked={itemForm.isGlutenFree}
                            onCheckedChange={(checked) => setItemForm({...itemForm, isGlutenFree: checked})}
                          />
                          <Label htmlFor="gluten-free">Gluten Free</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="available"
                            checked={itemForm.available}
                            onCheckedChange={(checked) => setItemForm({...itemForm, available: checked})}
                          />
                          <Label htmlFor="available">Available</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddItem}>Add Item</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
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
                  {menuCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredMenuItems.map((item) => (
                <Card key={item.id} className={`hover:shadow-lg transition-all duration-300 ${!item.available ? 'opacity-60' : ''}`}>
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-t-lg flex items-center justify-center">
                      <Image className="w-12 h-12 text-muted-foreground" />
                    </div>
                    {!item.available && (
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unavailable
                        </Badge>
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditItem(item)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAvailability(item.id)}>
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
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Item
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-2xl font-bold text-primary">${item.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-chart-4 fill-current" />
                          <span className="text-sm font-medium">{item.popularity}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                      
                      <div className="flex flex-wrap gap-1">
                        {getDietaryBadges(item)}
                        {getAllergenBadge(item.allergens)}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.preparationTime}min</span>
                        </div>
                        <span>{item.orderCount} orders</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update the details for {selectedItem?.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Item Name</Label>
                  <Input
                    id="edit-name"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Select value={itemForm.category} onValueChange={(value) => setItemForm({...itemForm, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {menuCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={itemForm.description}
                  onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-prep-time">Prep Time (minutes)</Label>
                  <Input
                    id="edit-prep-time"
                    type="number"
                    value={itemForm.preparationTime}
                    onChange={(e) => setItemForm({...itemForm, preparationTime: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label>Dietary Options</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-vegetarian"
                      checked={itemForm.isVegetarian}
                      onCheckedChange={(checked) => setItemForm({...itemForm, isVegetarian: checked})}
                    />
                    <Label htmlFor="edit-vegetarian">Vegetarian</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-vegan"
                      checked={itemForm.isVegan}
                      onCheckedChange={(checked) => setItemForm({...itemForm, isVegan: checked})}
                    />
                    <Label htmlFor="edit-vegan">Vegan</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-gluten-free"
                      checked={itemForm.isGlutenFree}
                      onCheckedChange={(checked) => setItemForm({...itemForm, isGlutenFree: checked})}
                    />
                    <Label htmlFor="edit-gluten-free">Gluten Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-available"
                      checked={itemForm.available}
                      onCheckedChange={(checked) => setItemForm({...itemForm, available: checked})}
                    />
                    <Label htmlFor="edit-available">Available</Label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateItem}>Update Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
