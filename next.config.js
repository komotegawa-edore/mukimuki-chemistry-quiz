/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hlfpnquhlkqjsqsipnea.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.microcms-assets.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      // www → non-www リダイレクト
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.edore-edu.com',
          },
        ],
        destination: 'https://edore-edu.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
