import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xddtoyyixxoeabwzsedi.supabase.co",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "uwndugkcrwhlirhtxfou.supabase.co",
      },
    ],
  },
};

export default nextConfig;
