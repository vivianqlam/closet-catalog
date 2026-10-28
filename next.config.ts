import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every page is personal to the logged-in user, so pages render per request
  // instead of being pre-built (cacheComponents off).
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
