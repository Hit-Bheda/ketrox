"use client"

import { Button } from '@/components/ui/button';

import { Search, ShoppingCart } from 'lucide-react';
import React from 'react'

export default function layout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-gray-200 min-h-screen">
            <header className="py-4 px-4">
                {/* Greeting + Cart */}
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Greeting */}
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Bonjour</p>
                            <h1 className="text-2xl font-semibold text-gray-900">Meachil Salan</h1>
                        </div>
                        {/* Search (desktop) + Cart */}
                        <div className="flex items-center">
                            {/* Search Bar - Desktop */}
                            <div className="relative me-4 hidden sm:block w-64">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    placeholder="Search Products..."
                                    className="pl-12 pr-4 py-2 rounded-full border border-gray-200 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                            {/* Cart */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-gray-700 hover:bg-gray-100 rounded-full"
                            >
                                <ShoppingCart className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                    {/* Search bar for mobile */}
                    <div className="relative mt-3 sm:hidden">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            placeholder="Search Products..."
                            className="w-full pl-12 pr-4 py-2 rounded-full border border-gray-200 bg-gray-100 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                </div>
            </header>

            {children}
        </div>

    )
}