// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nsqpvzakfeuhskevxfwq.supabase.co",
        pathname: "/**", // allow all Supabase storage paths
      },
    ],
  },
};

export default nextConfig;
