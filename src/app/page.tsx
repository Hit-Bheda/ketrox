"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";

export default function Home() {
  const { data: session, isPending, error } = authClient.useSession();
  console.log("Session data:", session);

  useEffect(() => {
    if (!isPending && !error) {
      if (isPending) {
        console.log("Loading session...");
      } else if (error) {
        console.error("Error fetching session:", error);
      } else if (session) {
        console.log("Session data:", session);
      }
    }
  }, [session, isPending, error]);

  const handleLogin = () => {
    // Replace with real login logic
    console.log("Redirecting to login...");
    window.location.href = "/signin"; // Redirect to the sign-in page
  };

  const handleSignup = () => {
    // Replace with real sign-up logic
    console.log("Redirecting to sign-up...");
    window.location.href = "/signup"; // Redirect to the sign-up page
  };

  const handleLogout = () => {
    // Replace with real logout logic
    console.log("Logging out...");
    authClient.signOut(); // Call the sign-out method from authClient
    window.location.href = "/"; // Redirect to the home page after logout
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to the Dashboard</h1>

      {isPending ? (
        <p className="text-lg">Loading...</p>
      ) : (
        <div className="flex space-x-4">
          {!session ? (
            <>
              <Button onClick={handleLogin}>Login</Button>
              <Button onClick={handleSignup}>Sign Up</Button>
            </>
          ) : (
            <Button onClick={handleLogout}>Logout</Button>
          )}
        </div>
      )}

      <div className="mt-8">
        <Image
          src="/images/dashboard-bg.jpg"
          alt="Dashboard Background"
          width={800}
          height={600}
          className="rounded-lg shadow-lg"
          priority
        />
      </div>
    </div>
  );
}
