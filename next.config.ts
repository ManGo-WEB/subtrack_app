import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.jsdelivr.net',
      },
      {
        protocol: 'https',
        hostname: 'yastatic.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.ozon.ru',
      },
      {
        protocol: 'https',
        hostname: 'static-basket-01.wb.ru',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
