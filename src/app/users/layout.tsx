"use client"

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

interface Restaurant {
  id: string;
  name: string;
  logo_url: string;
  address: string;
}

const taglines = [
  "Fresh Flavors • Happy Customers • Every Time",
  "Tasty Bites • Warm Smiles • Great Moments",
  "Savor • Enjoy • Repeat",
  "Crafted with Love • Served with Pride",
  "Flavors You’ll Remember • Service You’ll Love",
  "Eat Well • Live Well • Be Happy",
  "Good Food • Great Mood",
  "Taste. Joy. Memories.",
  "Fresh • Hot • Delicious",
  "Where Every Bite Counts"
];


function LayoutContent({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [tagline, setTagline] = useState(taglines[0]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId");

  useEffect(() => {
    const fetchRestaurant = async () => {
      if (!tenantId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/restaurant/${tenantId}`);
        const data = await response.json();

        if (data.success) {
          setRestaurant(data.restaurant);
        } else {
          console.error("Failed to fetch restaurant:", data.error);
        }
      } catch (error) {
        console.error("Error fetching restaurant:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [tenantId]);


  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning! Start your day with something delicious.";
    if (hour >= 12 && hour < 17) return "Good afternoon! Enjoy your favorite flavors.";
    if (hour >= 17 && hour < 21) return "Good evening! Time for a delightful meal.";
    return "Welcome! Treat yourself to something tasty tonight.";
  };

  useEffect(() => {
    // Pick a random tagline on component mount
    const randomIndex = Math.floor(Math.random() * taglines.length);
    setTagline(taglines[randomIndex]);
  }, []);

  return (
    <div className="bg-[#0b0d0f] border-t border-white/10 min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 bg-black/70 backdrop-blur border-b border-white/10">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo + Name */}
          <div className="flex items-center gap-3">
            {loading ? (
              // Skeleton for logo
              <div className="h-10 w-10 rounded-full bg-gray-700 animate-pulse" />
            ) : restaurant?.logo_url ? (
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                width={48}
                height={48}
                priority
                fetchPriority="high"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-amber-400 shadow-md"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center font-bold text-black shadow-md">
                {restaurant?.name?.charAt(0) || "R"}
              </div>
            )}

            <div>
              {loading ? (
                <>
                  {/* Skeleton for restaurant name */}
                  <div className="h-5 w-32 bg-gray-700 rounded animate-pulse mb-2"></div>
                  {/* Skeleton for tagline */}
                  <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                </>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {restaurant?.name || "Restaurant Name"}
                  </h1>
                  <p className="text-sm text-gray-400 italic">
                    {getWelcomeMessage()}
                  </p>
                </>
              )}
            </div>
          </div>


          <div className="hidden sm:block">
            <p className="text-amber-300 text-sm tracking-wide uppercase">
              {tagline}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-12 bg-[#0b0d0f] border-t border-white/10">
        <div className="container mx-auto px-6 py-12 grid gap-10 md:grid-cols-3 text-center md:text-left">

          {/* Logo + Name */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3">
              {restaurant?.logo_url ? (
                <Image
                  src={restaurant.logo_url}
                  alt={restaurant.name}
                  width={48}
                  height={48}
                  priority
                  fetchPriority="high"
                  className="h-12 w-12 rounded-full object-cover shadow-md ring-2 ring-amber-400"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-amber-400 flex items-center justify-center font-bold text-black shadow-md">
                  {restaurant?.name?.charAt(0) || "R"}
                </div>
              )}
              <h2 className="text-2xl font-bold text-white tracking-wide">
                {restaurant?.name || "Rangoli"}
              </h2>
            </div>
            <p className="text-sm text-gray-400 mt-3 italic">
             {tagline}
            </p>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-amber-400 font-semibold uppercase tracking-wide mb-2">
              Address
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {restaurant?.address || "123 Restaurant Street, City"}
            </p>
          </div>

          {/* About Us / Static Content */}
          <div>
            <h3 className="text-amber-400 font-semibold uppercase tracking-wide mb-2">
              About Us
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              We believe in serving delicious food made with love,
              fresh ingredients, and a warm atmosphere.
              Thank you for dining with us!
            </p>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} {restaurant?.name || "Rangoli"} Restaurant. All rights reserved.
        </div>
      </footer>

    </div>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense
      fallback={
        <div className="bg-[#0b0d0f] min-h-screen">
          <header className="py-4 px-4">
            <div className="container mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white">
                    Loading...
                  </h1>
                  <p className="text-sm text-white">Welcome back!</p>
                </div>
              </div>
            </div>
          </header>
          {children}
        </div>
      }
    >
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}
