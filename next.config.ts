import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.daisyui.com',
        pathname: '/**',
      },
      // AWS S3 configuration - update when you switch to S3
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com', // Matches: bucket-name.s3.region.amazonaws.com
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com', // Matches: bucket-name.s3.amazonaws.com
        pathname: '/**',
      },
    ],
    // Local patterns for development (filesystem)
    localPatterns: [
      {
        pathname: '/images/**',
      },
      {
        pathname: '/gifs/**',
      },
      {
        pathname: '/vectors/**',
      },
      {
        pathname: '/placeholder/**',
      },
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
