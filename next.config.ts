import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only use basePath for GitHub Pages deployment, not for local builds
  basePath: process.env.BASE_PATH === 'true' ? '/scraper' : '',
  distDir: 'out',
};

export default nextConfig;
