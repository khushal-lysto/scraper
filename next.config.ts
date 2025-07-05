import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' && process.env.BASE_PATH === 'true' ? '/dashboard' : '',
  distDir: 'out',
};

export default nextConfig;
