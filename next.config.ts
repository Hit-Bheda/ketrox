// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["hubdhvwpxnxdlohijaug.supabase.co"], // ✅ allow Supabase signed URLs
  },
};

export default nextConfig;
