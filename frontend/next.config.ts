import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: false,
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `http://localhost:8000/api/:path*`,
            },
        ];
    },
};

export default nextConfig;

