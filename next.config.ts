import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // skip ESLint during production build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // skip TypeScript type checking during production build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
