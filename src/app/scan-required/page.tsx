"use client";
import { QrCode, Smartphone, Utensils, Sparkles, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";

export default function ScanRequiredPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[oklch(0.9674_0.0013_286.3752)] to-[oklch(0.9197_0.0040_286.3202)] px-4 py-8">
      <div className={`bg-card rounded-2xl shadow-lg p-8 max-w-md w-full transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} border border-border`}>
        {/* Animated QR Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full animate-pulse"></div>
            <div className="relative bg-primary p-4 rounded-2xl shadow-lg">
              <QrCode className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
        </div>
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-center mb-4 bg-gradient-to-r from-primary to-[oklch(0.6461_0.1943_41.1158)] bg-clip-text text-transparent">
          Scan to Discover Our Menu
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground text-center mb-6 leading-relaxed">
          Unlock our digital menu experience by scanning the QR code at your table. Enjoy seamless browsing, real-time updates, and exclusive offers.
        </p>
        
        {/* Steps */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center bg-accent p-3 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground mr-3">
              1
            </div>
            <p className="text-accent-foreground">Locate the QR code at your table</p>
          </div>
          
          <div className="flex items-center bg-accent p-3 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground mr-3">
              2
            </div>
            <p className="text-accent-foreground">Open your camera app and scan the code</p>
          </div>
          
          <div className="flex items-center bg-accent p-3 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground mr-3">
              3
            </div>
            <p className="text-accent-foreground">Explore our menu and place your order</p>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-2 flex items-center">
            <Sparkles className="w-4 h-4 mr-2 text-[oklch(0.6461_0.1943_41.1158)]" />
            Need help scanning?
          </h3>
          <p className="text-sm text-muted-foreground">
            Ask our staff for assistance or use a QR scanner app from your app store.
          </p>
        </div>
        
        {/* Visual Elements */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <Smartphone className="w-5 h-5 mr-2 text-primary" />
            Camera app
          </div>
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <div className="flex items-center text-sm text-muted-foreground">
            <Utensils className="w-5 h-5 mr-2 text-primary" />
            Digital menu
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="flex justify-center space-x-2">
          {[...Array(5)].map((_, i) => (
            <div 
              key={i} 
              className="w-2 h-2 bg-primary/30 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
      
      {/* Footer Note */}
      <p className="text-sm text-muted-foreground mt-6 text-center max-w-md">
        By scanning our QR code, you&apos;ll access the most up-to-date menu with current availability and pricing.
      </p>
    </div>
  );
}