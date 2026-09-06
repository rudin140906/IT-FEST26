import type { NextConfig } from "next";
import path from "node:path";

// The cPanel document root is the renamed IT-Fest folder. Keep development at
// the root so `next dev` remains available at localhost:3000.
const siteBasePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || (process.env.NODE_ENV === "production" ? "/IT-Fest" : "");
const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  // Only use static export for production builds (cPanel deploy).
  // During development, API routes need to run dynamically.
  ...(process.env.NODE_ENV === "production" ? { output: "export" } : {}),
  basePath: siteBasePath || undefined,
  assetPrefix: siteBasePath || undefined,
  trailingSlash: true,
  turbopack: {
    root: projectRoot,
  },
  experimental: {
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 1,
    staticGenerationRetryCount: 1,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
