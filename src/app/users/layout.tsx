"use client"

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ShoppingBag, ShoppingCart } from 'lucide-react';
import React from 'react'
import Menu from '../dashboard/admin/menu/page';

export default function layout({ children }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className='px-4'>
            <header className="py-4">
                {/* Greeting + Cart */}
                <div className="container mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Bonjour</p>
                            <h1 className="text-2xl font-semibold text-white">Meachil Salan</h1>
                        </div>
                        <div className="flex">
                            <div className="relative me-4 hidden sm:block">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="Rechercher des produits..."
                                    className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-primary/50 focus:ring-primary/20"
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                                <ShoppingCart className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                    {/* Second input (visible only on mobile) */}
                    <div className="relative mt-3 sm:hidden">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                            placeholder="Rechercher des produits..."
                            className="pl-12 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-primary/50 focus:ring-primary/20"
                        />
                    </div>
                </div>
            </header>
            {children}
        </div>
    )
}
