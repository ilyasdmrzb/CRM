import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            // NOT: 'unsafe-eval' Next.js geliştirme modunda Fast Refresh ve Sourcemaps için zorunludur.
            // Production build alırken bu kısmı kaldırmanız güvenliğinizi artıracaktır.
            value: "default-src 'self'; " +
                   "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
                   "style-src 'self' 'unsafe-inline'; " +
                   "img-src 'self' data: blob: https:; " +
                   "media-src 'self' data: blob:; " +
                   "font-src 'self' data:; " +
                   "connect-src 'self' http://localhost:5296 https://localhost:5296; " +
                   "object-src 'none'; " +
                   "base-uri 'self';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
