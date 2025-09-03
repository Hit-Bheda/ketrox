// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["hubdhvwpxnxdlohijaug.supabase.co","https://jqxndijvrntycteqtwkj.supabase.co"], // ✅ allow Supabase signed URLs
  },
};

export default nextConfig;
