"use client";
import { QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ScanRequiredPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-800 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        <QrCode className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold mb-2">Scan QR Code Required</h1>
        <p className="mb-6 text-center text-gray-600">
          To access the menu and user panel, please scan the QR code provided at your table or by the restaurant. This ensures you see the correct menu for your location.
        </p>
        <Button asChild className="w-full">
          <Link href="/">Go to Home</Link>
        </Button>
      </div>
    </div>
  );
}
