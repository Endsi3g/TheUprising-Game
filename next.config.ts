import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce strict mode for better error catching
  reactStrictMode: true,

  // Optimize images from external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for now, tighten later based on actual usage
      },
    ],
  },

  // Enable experimental features if needed
  experimental: {
    serverActions: {
      bodySizeLimit: '4mb', // Increase limit for potential file uploads
    },
  },
};

export default nextConfig;
