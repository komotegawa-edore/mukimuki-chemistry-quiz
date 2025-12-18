import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/api/',
        '/login',
        '/signup',
        '/forgot-password',
        '/reset-password',
        '/auth/',
        '/juku-admin/',
        '/note/login',
        '/note/signup',
        '/english/login',
        '/english/signup',
      ],
    },
    sitemap: 'https://edore-edu.com/sitemap.xml',
  }
}
