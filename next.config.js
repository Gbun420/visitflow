/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";
const isVercelPreview = process.env.VERCEL_ENV === "preview";

const buildCsp = () => {
  const isLocal = !isProd && !isVercelPreview;
  
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isLocal ? " 'unsafe-eval'" : ""}${!isProd || isVercelPreview ? " https://vercel.live" : ""} https://js.stripe.com`,
    `script-src-elem 'self' 'unsafe-inline'${!isProd || isVercelPreview ? " https://vercel.live" : " https://vercel.live"} https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline'",
    `font-src 'self' https://r2cdn.perplexity.ai${!isProd || isVercelPreview ? " https://vercel.live" : ""}`,
    "img-src 'self' blob: data: https:",
    `connect-src 'self' https://*.supabase.co https://api.stripe.com${!isProd || isVercelPreview ? " https://vercel.live" : ""}`,
    `frame-src 'self' https://js.stripe.com${!isProd || isVercelPreview ? " https://vercel.live" : ""}`,
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "report-uri /api/csp-report",
  ];

  return directives.join("; ");
};

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  output: "standalone",
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCsp(),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubdomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), fullscreen=()",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: isProd ? "https://visitflow-lovat.vercel.app" : "*",
          },
          {
            key: "Cache-Control",
            value: "public, max-age=3600, stale-while-revalidate=86400",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
