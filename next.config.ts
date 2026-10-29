import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is personal to the logged-in user, so pages render per request
  // instead of being pre-built (cacheComponents off).
  experimental: {
    serverActions: {
      // Photos are shrunk in the browser to about 1 MB before upload; this
      // leaves room for that plus the form's own overhead.
      bodySizeLimit: "2mb",
    },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
