"use client";
import { ShieldAlert, LogIn, Home } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function UnauthorizedPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Countdown timer for automatic redirect
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = "/";
    }
  }, [countdown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.9674_0.0013_286.3752)] to-[oklch(0.9197_0.0040_286.3202)] px-4 py-8">
      <div className="bg-card rounded-2xl shadow-lg p-8 max-w-md w-full border border-border">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-destructive/20 p-4 rounded-full">
            <ShieldAlert className="w-12 h-12 text-destructive" />
          </div>
        </div>
        
        {/* Header */}
        <h1 className="text-2xl font-bold text-center mb-4 text-foreground">
          Unauthorized Access
        </h1>
        
        {/* Message */}
        <div className="bg-muted p-4 rounded-lg mb-6">
          <p className="text-muted-foreground text-center">
            You don&apos;t have permission to access this page. This might be because:
          </p>
          <ul className="mt-3 text-sm text-muted-foreground space-y-1">
            <li className="flex items-start">
              <span className="text-destructive mr-2">•</span>
              Your session may have expired
            </li>
            <li className="flex items-start">
              <span className="text-destructive mr-2">•</span>
              You don&apos;t have the required permissions
            </li>
            <li className="flex items-start">
              <span className="text-destructive mr-2">•</span>
              You need to log in with a different account
            </li>
          </ul>
        </div>

        {/* Countdown */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground">
            Redirecting to home page in{" "}
            <span className="font-semibold text-destructive">{countdown}</span> seconds
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/signin" >
            <button className="w-full flex items-center mb-2 justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors">
              <LogIn className="w-5 h-5" />
              Sign In Again
            </button>
          </Link>
          
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-3 px-4 rounded-lg transition-colors">
              <Home className="w-5 h-5" />
              Go to Home Page
            </button>
          </Link>
        </div>

        {/* Support Message */}
        <div className="mt-6 p-3 bg-secondary/20 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            If you believe this is an error, please contact your system administrator for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}