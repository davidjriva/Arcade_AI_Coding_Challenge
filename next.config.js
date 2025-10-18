/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Allow serving static files from output directory
  async rewrites() {
    return [
      {
        source: '/output/:path*',
        destination: '/api/static/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
