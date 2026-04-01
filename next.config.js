/** @type {import('next').NextConfig} */
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
    const isProd = process.env.NODE_ENV === "production";
    const isVercelPreview = process.env.VERCEL_ENV === "preview";

    const cspDirectives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' https://r2cdn.perplexity.ai",
      "img-src 'self' blob: data: https:",
      "connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
    ];

    // Add Vercel Live feedback and fonts ONLY in preview/dev, NOT in production
    if (!isProd || isVercelPreview) {
      cspDirectives[1] += " https://vercel.live"; // script-src
      cspDirectives[3] += " https://vercel.live"; // font-src
      cspDirectives[5] += " https://vercel.live"; // connect-src
      cspDirectives[6] += " https://vercel.live"; // frame-src
    }

    const cspValue = cspDirectives.join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspValue,
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
            value: "https://visitflow-lovat.vercel.app", // Restricted CORS
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
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
