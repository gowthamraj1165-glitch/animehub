import type { NextConfig } from "next";

/**
 * Baseline security headers applied to every response.
 * (No CSP yet: the YouTube iframe and hls.js need a considered policy.)
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework version.
  poweredByHeader: false,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Jikan returns artwork hosted on MyAnimeList's CDN
    remotePatterns: [{ protocol: "https", hostname: "cdn.myanimelist.net" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
