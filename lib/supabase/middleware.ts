import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 公開ページのパス
  const publicPaths = [
    '/login',
    '/signup',
    '/auth',
    '/lp',
    '/blog',
    '/api',
    '/home',
    '/privacy',
    '/terms',
    '/roopy-roadmap',
    '/mbti',
    '/try',
    '/english/login',
    '/english/signup',
    '/english/news',
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  ) ||
    request.nextUrl.pathname === '/sitemap.xml' ||
    request.nextUrl.pathname === '/robots.txt'

  // 未認証ユーザーを/homeにリダイレクト
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーがログイン/登録ページにアクセスした場合はリダイレクト
  const loginPaths = ['/login', '/signup', '/english/login', '/english/signup']
  if (user && loginPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    // /english系からのアクセスは/english/newsへ、それ以外は/へ
    url.pathname = request.nextUrl.pathname.startsWith('/english') ? '/english/news' : '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
