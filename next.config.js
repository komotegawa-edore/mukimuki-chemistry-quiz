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
  // NOTE: www → non-www リダイレクトはVercelのドメイン設定で行う
  // Vercel Dashboard → Settings → Domains で edore-edu.com をPrimaryに設定
}

module.exports = nextConfig
