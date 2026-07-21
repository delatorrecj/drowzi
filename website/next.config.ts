import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server mode (no static export) so /api routes run for the OpenAI helpers.
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
