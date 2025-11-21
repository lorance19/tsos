import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.daisyui.com',
        pathname: '/**',
      },
    ],
    qualities: [75, 90],
  },
};

export default nextConfig;
