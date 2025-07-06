/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Generator',
            value: 'DIU Learning Platform',
          },
          {
            key: 'X-Creator',
            value: 'DIU CSE Department',
          },
        ],
      },
    ]
  },
}

export default nextConfig
