
export interface HotelType {
  id: string;
  name: string;
  owner_name: string; // Consider camelCase: ownerName
  owner_phone: string; // Consider camelCase: ownerPhone
  plan: string; // Could be further refined with an enum if plans are fixed
  address: string;
  status: string; // Could be further refined with an enum if statuses are fixed
  created_at: string; // ISO date string, consider Date if parsed
  logo_url: string;
  email: string;
  // rooms?: number; // Uncomment if you plan to use the rooms property
}

// Optional: Define enums for fixed sets of values to improve type safety
// Uncomment and adjust values as needed

export enum HotelStatus {
  Active = "active",
  Trial = "trial",
  Suspended = "suspended",
  Expired = "expired"
}

export enum HotelPlan {
  Free = "free",
  Standard = "standard",
  Pro = "pro" // Add if Pro is used
}


// Optional: Define types for the status and plan color mappings
// This makes the keys in statusColorStyles and planColorStyles type-safe
export type StatusColorStyles = {
  [key: string]: string; // Or [key in HotelStatus]?: string; if using enum
};

export type PlanColorStyles = {
  [key: string]: string; // Or [key in HotelPlan]?: string; if using enum
};

// Re-export types from schema if needed elsewhere (optional)
// import { hotelSchema } from "@/schemas";
// import { z } from "zod";
// export type HotelFormData = z.infer<typeof hotelSchema>;
