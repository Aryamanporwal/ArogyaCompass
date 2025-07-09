import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    images: {
    domains: ['fra.cloud.appwrite.io'],
  },
   experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // or '20mb'
    },
  },
};

export default nextConfig;
