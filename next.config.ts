
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  cacheComponents: true,

  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
