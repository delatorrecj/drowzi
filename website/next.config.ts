import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: import.meta.dirname,
  },
  webpack: (config) => {
    config.resolve ??= {};
    config.resolve.alias ??= {};
    return config;
  },
};

export default nextConfig;
