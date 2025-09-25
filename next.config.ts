import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    // 🚀 Skip ESLint during production builds (we'll run it locally instead)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
