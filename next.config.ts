import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  allowedDevOrigins: ['*.cryonx.work'],
  experimental: {
    globalNotFound: true,
  },
};

export default nextConfig;
