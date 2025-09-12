"use client"

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Restaurant {
    id: string;
    name: string;
    logo_url: string;
    address: string;
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('tenantId');

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
          console.error('Failed to fetch restaurant:', data.error);
        }
      } catch (error) {
        console.error('Error fetching restaurant:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [tenantId]);

  return (
    <div className="bg-gray-200 min-h-screen">
      <header className="py-4 px-4">
        {/* Greeting + Cart */}
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            {/* Greeting */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {loading ? 'Loading...' : restaurant?.name || 'Restaurant Name'}
              </h1>
              <p className="text-sm text-gray-600">Welcome back!</p>
            </div>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}

// Main layout component with Suspense
export default function Layout({ children }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Suspense fallback={
      <div className="bg-gray-200 min-h-screen">
        <header className="py-4 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
                <p className="text-sm text-gray-600">Welcome back!</p>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    }>
      <LayoutContent>{children}</LayoutContent>
    </Suspense>
  );
}