"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Clock,
  Star,
  DollarSign,
  ChefHat,
  CheckCircle,

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
import { MenuImageSlider } from "@/components/menu/MenuImageSlider";


import { DescriptionPopover } from "@/components/menu/DescriptionPopover";


type DietaryOption = "vegetarian" | "vegan" | "glutenFree";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string | "";
  preparationTime: string | "";
  dietary: DietaryOption[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  available: boolean;
  image?: string[];
};


export default function Menu() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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

  type ApiMenuItem = {
    id: string;
    item_name?: string;
    name?: string;
    category: string;
    description: string;
    price:
    | "";
    preparationTime: number | "";
    item_logo?: string;
    image?: string[];
    prepTime?: number | string;
    dietaty?: DietaryOption[];
    dietary?: DietaryOption[];
    isAvailable?: boolean;
  };

  const featchhMenuItems = async () => {
    try {
      const response = await fetch('/api/admin/menu', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      console.log("Fetched menu items:", data.menu);
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
      console.log("menuuu itemmmmmmms:", mappedMenu);

    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  useEffect(() => {
    featchhMenuItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const uniqueCategories = Array.from(
    new Set(menuItems.map(item => item.category).filter(Boolean))
  );

  const categoryStats = uniqueCategories.map(category => ({
    id: category,
    name: category,
    count: menuItems.filter(item => item.category === category).length,
    available: menuItems.filter(item => item.category === category && item.available).length,
  }));

 
  const totalStats = {
    totalItems: menuItems.length,
    availableItems: menuItems.filter(item => item.available).length,
    avgPrice: menuItems.length > 0 ? menuItems.reduce((sum, item) => sum + Number(item.price), 0) / menuItems.length : 0,
    topRated: menuItems.length > 0 ? menuItems[0] : { popularity: 0, name: "" }
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
        <Card>

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
                      <Card key={item.id} className={`hover:shadow-lg transition-all py-0 duration-300 border-1 ${!item.available ? 'opacity-60' : ''}`}>
                        <div className="relative rounded-t-xl overflow-hidden">
                          {/* Image */}

                          <MenuImageSlider images={item.image || []} alt={item.name} />
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
      </div>
    </>
  );
}
