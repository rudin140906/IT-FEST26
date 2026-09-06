import type { NextConfig } from "next";
import path from "node:path";

const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  basePath: siteBasePath || undefined,
  assetPrefix: siteBasePath || undefined,
  turbopack: {
    root: projectRoot,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },
};

export default nextConfig;
