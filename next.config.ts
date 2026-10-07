import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self), payment=(self)" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: __dirname },
  images: {
    // Editorial photography is served from a CDN that resizes on the fly.
    // Swap the loader for your own DAM / Supabase Storage / Cloudinary when going live.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/men", destination: "/men/clothing", permanent: true },
      // Retired categories — the store now focuses on topwear and designer wear.
      ...["jeans", "trousers", "footwear", "accessories", "activewear", "loungewear", "bottomwear"].map((c) => ({ source: `/men/${c}`, destination: "/men/clothing", permanent: true })),
      { source: "/cart", destination: "/bag", permanent: true },
      { source: "/collections/linen", destination: "/collections/resort", permanent: true },
      { source: "/login", destination: "/account/login", permanent: true },
      { source: "/register", destination: "/account/register", permanent: true },
    ];
  },
};

export default nextConfig;
