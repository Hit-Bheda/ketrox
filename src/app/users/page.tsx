"use client";

import React, { useEffect, useState } from "react";
import { ChefHat, Clock, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
const menuCategories = [
  { id: "appetizers", name: "Appetizers" },
  { id: "mains", name: "Main Courses" },
  { id: "sides", name: "Side Dishes" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
];

type DietaryOption = "vegetarian" | "vegan" | "glutenFree";

type MenuItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  preparationTime: number;
  dietary: DietaryOption[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  available: boolean;
  image?: string;
};

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


export default function Page() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  console.log(menuItems)

  type ApiMenuItem = {
    id: string;
    ItemName?: string;
    name?: string;
    category: string;
    description: string;
    price: number | string;
    Item_logo?: string;
    image?: string;
    prepTime?: number | string;
    preparationTime?: number | string;
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
      const mappedMenu: MenuItem[] = (data.menu || []).map((item: ApiMenuItem) => ({
        id: String(item.id),
        name: item.ItemName || item.name || "",
        category: item.category,
        description: item.description,
        price: Number(item.price),
        image: item.Item_logo || item.image || "",
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="container mx-auto bg-gray-200 min-h-screen">
      <div className="w-full py-8">
        {/* Header (Categories) */}
        <div className="flex flex-wrap lg:flex-nowrap items-center mb-6 gap-4 overflow-x-auto">
          {[{ id: "all", name: "All" }, ...menuCategories].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition whitespace-nowrap
                ${activeCategory === cat.id
                  ? "bg-[#2c2c2c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"}
              `}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grouped menu items like admin */}
        {(activeCategory === "all" ? menuCategories : menuCategories.filter((c) => c.id === activeCategory)).map((category) => {
          const itemsInCategory = menuItems.filter((item) => item.category === category.id);
          if (itemsInCategory.length === 0) return null;
          return (
            <div key={category.id} className="mb-8">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#2c2c2c]">
                <span>{category.name}</span>
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {itemsInCategory.map((p) => (
                  <Card key={p.id} className={`hover:shadow-lg transition-all py-0 duration-300 bg-white border-1 ${!p.available ? "opacity-60" : ""}`}>
                    <div className="relative rounded-t-xl overflow-hidden">
                      <div className="aspect-video bg-muted relative">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="object-cover w-full h-full transition-transform duration-300 hover:scale-105" />
                        ) : (
                          <ChefHat className="w-12 h-12 text-muted-foreground m-auto" />
                        )}
                      </div>
                      {!p.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-t-xl">
                          <Badge variant="destructive" className="px-3 py-1 text-xs font-medium">
                            <XCircle className="w-3 h-3 mr-1" />
                            Unavailable
                          </Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="pb-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                          {p.name}
                        </h3>
                        <span className="text-xl font-bold text-slate-900">
                          ${p.price}
                        </span>
                      </div>

                      <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                        {p.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {getDietaryBadges(p)}
                        </div>

                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                          <Clock className="h-4 w-4" />
                          <span>{p.preparationTime}min</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}