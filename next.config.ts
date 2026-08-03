import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  experimental: {
    appNewScrollHandler: true,
    cachedNavigations: true,
    inlineCss: true,
    prefetchInlining: true,
    turbopackFileSystemCacheForDev: true,
  },
  images: {
    remotePatterns: [
      {
        hostname: "img.youtube.com",
        protocol: "https",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: false,
    },
    incomingRequests: false,
  },
  output: "standalone",
  poweredByHeader: false,
  reactCompiler: true,
};

export default nextConfig;
