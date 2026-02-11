import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.mindos.com" },
      { protocol: "https", hostname: "**.second.me" },
    ],
  },
};

export default nextConfig;
