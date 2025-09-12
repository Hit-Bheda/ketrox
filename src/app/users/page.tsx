"use client";
import React, { useEffect, useRef, useState } from "react";
import { Clock, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserMenuImageSlider } from "@/components/usercompoments/UserMenuImageSlider";
import Image from "next/image";
import { UserDescPopover } from "@/components/usercompoments/UserDescPopover";
import { ApiMenuItem, DietaryOption, MenuItem } from "@/types";


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
    <Badge
      key={diet}
      className={`${badgeColors[diet]} px-2 py-0.5 rounded-full text-xs font-medium`}
    >
      {diet.charAt(0).toUpperCase() + diet.slice(1)}
    </Badge>
  ));
};

export default function Page() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");


useEffect(() => {
  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/admin/menu", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Failed to fetch menu items");

      const data = await response.json();

      const mappedMenu: MenuItem[] = (data.menu || []).map((item: ApiMenuItem) => ({
        id: String(item.id),
        name: item.item_name || item.name || "",
        category: normalizeCategoryId(item.category),
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

      // 🔹 Extract unique categories dynamically
      const uniqueCats = Array.from(
        new Set(mappedMenu.map((item) => item.category))
      ).map((cat) => ({
        id: cat,
        name: cat.charAt(0).toUpperCase() + cat.slice(1),
      }));

      setCategories(uniqueCats);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
  };

  fetchMenuItems();
}, []);

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
  }, [categories]);

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
        <Image
          src="/images/login-bg.jpg"
          fill
          alt="Menu hero"
          priority
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
          <p className="uppercase tracking-[0.35em] text-amber-300/80 text-xs sm:text-sm">
            Delicious • Amazing
          </p>
          <h1 className="mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold">
            Our Menu
          </h1>
        </div>

        {/* Category Nav */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 max-w-[90vw] px-4 sm:px-6 z-20">
          <div className="relative">
            <div
              ref={categoriesRef}
              className="flex flex-nowrap items-center gap-2 rounded-full bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30 px-3 py-2 border border-white/10 overflow-x-auto scrollbar-hidden"
            >
              {[{ id: "all", name: "All" }, ...categories].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition whitespace-nowrap border cursor-pointer ${activeCategory === cat.id
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

      {/* Content */}
      <section className="relative" ref={contentRef}>
        <div className="relative mx-auto w-full max-w-[95vw] sm:max-w-4xl md:max-w-5xl px-4 sm:px-6 pt-12 sm:pt-16 pb-16">
          {(activeCategory === "all" ? categories : categories.filter((c) => c.id === activeCategory)).map(
            (category) => {
              const itemsInCategory = menuItems.filter(
                (item) => normalizeCategoryId(item.category) === category.id
              );
              if (itemsInCategory.length === 0) return null;

              return (
                <section key={category.id} className="mb-10 sm:mb-12">
                  <div className="flex items-center gap-4 mb-4 sm:mb-6">
                    <div className="h-px flex-1 bg-white/10" />
                    <h2 className="text-lg sm:text-xl md:text-2xl tracking-wide font-semibold text-amber-300/90">
                      {category.name}
                    </h2>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <div className="grid gap-6 sm:gap-8 md:gap-10 grid-cols-1 sm:grid-cols-2">
                    {itemsInCategory.map((p) => (
                      <div key={p.id} className={`group ${!p.available ? "opacity-60" : ""}`}>
                        <div className="flex items-start gap-4 sm:gap-6">
                          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15 bg-white/5">
                            <UserMenuImageSlider images={p.image || []} alt={p.name} />
                          </div>

                          <div className="w-full">
                            <div className="flex items-baseline gap-2 sm:gap-3">
                              <h3 className="text-base sm:text-lg md:text-xl font-semibold">
                                {p.name}
                              </h3>
                              <div className="flex-1 border-b border-dashed border-white/15" />
                              <span className="text-amber-300 font-semibold text-sm sm:text-base">
                                ${p.price}
                              </span>
                            </div>
                            <div className="relative group">
                              <UserDescPopover
                                description={p.description}
                                className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-300/80 line-clamp-2"
                              />
                            </div>

                            <div className="mt-2 sm:mt-3 flex items-center justify-between text-xs sm:text-sm">
                              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                {getDietaryBadges(p)}
                              </div>
                              <div className="inline-flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{p.preparationTime}min</span>
                              </div>
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
            }
          )}
        </div>
      </section>
    </div>
  );
}
