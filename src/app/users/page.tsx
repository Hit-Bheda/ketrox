"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChefHat, Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

const normalizeCategoryId = (raw: string): string => {
  if (!raw) return "";
  const value = raw.toLowerCase().trim();
  if (["appetizer", "appetizers"].includes(value)) return "appetizers";
  if (["main", "mains", "main course", "main courses"].includes(value)) return "mains";
  if (["side", "sides", "side dish", "side dishes"].includes(value)) return "sides";
  if (["dessert", "desserts"].includes(value)) return "desserts";
  if (["beverage", "beverages", "drinks", "drink"].includes(value)) return "beverages";
  return value;
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
        category: normalizeCategoryId(item.category),
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
  const categoriesRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;
    const checkOverflow = () => {
      setIsOverflowing(el.scrollWidth > el.clientWidth + 2);
    };
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [menuItems]);

  const scrollCats = (delta: number) => {
    categoriesRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#0b0d0f] text-gray-100">
      {/* Hero */}
      <div className="relative h-64 sm:h-80 md:h-96 lg:h-[420px] w-full">
        <img
          src="/images/login-bg.jpg"
          alt="Menu hero"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <p className="uppercase tracking-[0.35em] text-amber-300/80 text-xs sm:text-sm">Delicious • Amazing</p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">Our Menu</h1>
        </div>
        {/* Category Nav pinned to hero bottom */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2  max-w-[90vw] px-4 sm:px-6 z-20">
          <div className="relative">
            <div
              ref={categoriesRef}
              className="flex flex-nowrap items-center gap-2 rounded-full bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 px-3 py-2 border border-white/10 overflow-x-auto scrollbar-hidden"
              style={{ scrollBehavior: "smooth" }}
            >
              {[{ id: "all", name: "All" }, ...menuCategories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap border cursor-pointer ${
                    activeCategory === cat.id
                      ? "bg-amber-400 text-black border-amber-400"
                      : "text-gray-200 border-white/10 hover:border-amber-400/60"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
            {isOverflowing && (
              <>
                <button
                  aria-label="Scroll categories left"
                  onClick={() => scrollCats(-150)}
                  className="absolute -left-3 sm:-left-4 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white/90 hover:bg-black/80 border border-white/10"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  aria-label="Scroll categories right"
                  onClick={() => scrollCats(150)}
                  className="absolute -right-3 sm:-right-4 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-black/60 text-white/90 hover:bg-black/80 border border-white/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content with decorative background */}
      <section className="relative" ref={contentRef}>
        <div className="pointer-events-none select-none absolute inset-0 overflow-hidden z-0">
          {/* Left side tall illustration */}
          <img
            src="https://kalanidhithemes.com/live-preview/landing-page/delici/all-demo/Delici-Defoult/images/background/bg-5.png"
            alt="Decorative vegetables"
            className="absolute left-0 top-10 sm:top-12 md:top-16 h-[480px] sm:h-[600px] md:h-[760px] w-auto opacity-[2.16] animate-float-y z-[1]"
          />
          {/* Bottom-right illustration */}
          <img
            src="https://kalanidhithemes.com/live-preview/landing-page/delici/all-demo/Delici-Defoult/images/background/bg-6.png"
            alt="Decorative pitcher and tomato"
            className="absolute right-0 bottom-0 h-[300px] sm:h-[360px] md:h-[420px] w-auto opacity-[2.16] animate-float-y-rev z-[1]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0b0d0f] z-0" />
        </div>
        <div className="relative mx-auto w-full max-w-[95vw] sm:max-w-4xl md:max-w-5xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
          {(activeCategory === "all" ? menuCategories : menuCategories.filter((c) => c.id === activeCategory)).map((category) => {
            const itemsInCategory = menuItems.filter((item) => normalizeCategoryId(item.category) === category.id);
            if (itemsInCategory.length === 0) return null;
            return (
              <section key={category.id} className="mb-10 sm:mb-12">
                <div className="flex items-center gap-4 mb-4 sm:mb-6">
                  <div className="h-px flex-1 bg-white/10" />
                  <h2 className="text-lg sm:text-xl md:text-2xl tracking-wide font-semibold text-amber-300/90">{category.name}</h2>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2">
                  {itemsInCategory.map((p) => (
                    <div key={p.id} className={`group ${!p.available ? "opacity-60" : ""}`}>
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-white/15 bg-white/5">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full grid place-items-center"><ChefHat className="h-5 w-5 sm:h-6 sm:w-6 text-white/50" /></div>
                          )}
                        </div>
                        <div className="w-full">
                          <div className="flex items-baseline gap-2 sm:gap-3">
                            <h3 className="text-sm sm:text-base md:text-lg font-semibold">{p.name}</h3>
                            <div className="flex-1 border-b border-dashed border-white/15" />
                            <span className="text-amber-300 font-semibold text-sm sm:text-base">${p.price}</span>
                          </div>
                          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-300/80">{p.description}</p>
                          <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs">
                            <div className="flex flex-wrap gap-1 sm:gap-1.5">{getDietaryBadges(p)}</div>
                            <div className="inline-flex items-center gap-1"><Clock className="h-3 w-3 sm:h-4 sm:w-4" /><span>{p.preparationTime}min</span></div>
                          </div>
                        </div>
                      </div>
                      {!p.available && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-red-300 ring-1 ring-red-400/20">
                          <XCircle className="h-3 w-3" /> Unavailable
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>
      {/* Local animations for subtle float */}
      <style jsx>{`
        @keyframes floatY {
          0% { transform: translateY(0); }
          50% { transform: translateY(-28px); }
          100% { transform: translateY(0); }
        }
        .animate-float-y { animation: floatY 12s ease-in-out infinite; }
        .animate-float-y-rev { animation: floatY 8s ease-in-out infinite reverse; }
        .scrollbar-hidden::-webkit-scrollbar { display: none; }
        .scrollbar-hidden { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {/* Footer */}
      <footer className="relative overflow-hidden border-t border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <img
            src="https://kalanidhithemes.com/live-preview/landing-page/delici/all-demo/Delici-Defoult/images/background/image-4.jpg"
            alt="Footer background"
            className="absolute right-0 top-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[#0b0d0f]/20" />
        </div>
        <div className="relative mx-auto max-w-full   ">
          <div className="p-8 sm:p-12 bg-[#0b0d0f]/60">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-xl sm:text-2xl font-semibold">Delici Restaurant</div>
              <p className="text-xs sm:text-sm text-gray-300">Restaurant St, Delicious City, London 9578, UK</p>
              <p className="text-xs sm:text-sm text-gray-300">booking@domainname.com</p>
              <p className="text-xs sm:text-sm text-gray-300">Booking Request: +88-123-123456</p>
              <p className="text-xs sm:text-sm text-gray-300">Open: 09:00 am - 01:00 pm</p>
              <div className="pt-2">
                <div className="text-base sm:text-lg md:text-xl">Get News & Offers</div>
                <p className="text-xs text-gray-400">Subscribe us & get 25% off</p>
              </div>
              <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 justify-center max-w-xs mx-auto">
                <Input
                  placeholder="Your email"
                  className="bg-black/40 border-white/10 text-gray-100 placeholder:text-gray-400 text-xs sm:text-sm"
                />
                <Button className="bg-amber-400 text-black hover:bg-amber-300 text-xs sm:text-sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="relative border-t border-white/10 py-4 sm:py-6 text-center text-xs text-gray-400 bg-[#0b0d0f]/60">
          © 2025 Ketrox. All Rights Reserved
        </div>
      </footer>
    </div>
  );
}