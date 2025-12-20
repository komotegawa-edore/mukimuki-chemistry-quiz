import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // NOTE: www → non-www リダイレクトはVercelのドメイン設定で行う
  // Vercel Dashboard → Settings → Domains で edore-edu.com をPrimaryに設定

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

  // =============================================
  // カスタムドメイン処理
  // =============================================
  const mainDomains = ['edore-edu.com', 'www.edore-edu.com', 'localhost', '127.0.0.1']
  const isMainDomain = mainDomains.some(d => host.includes(d)) || host.includes('vercel.app')

  // カスタムドメインからのアクセスの場合
  if (!isMainDomain && host) {
    // ドメインからサイトを検索
    const { data: site } = await supabase
      .from('juku_sites')
      .select('slug, is_published')
      .eq('custom_domain', host.replace(/^www\./, ''))  // www.を除去して検索
      .single()

    if (site && site.is_published) {
      // /juku/[slug] にリライト（URLは変わらない）
      const url = request.nextUrl.clone()
      url.pathname = `/juku/${site.slug}${request.nextUrl.pathname}`
      return NextResponse.rewrite(url)
    }

    // サイトが見つからない場合は404的な対応（メインサイトへリダイレクト）
    if (!site) {
      return NextResponse.redirect(new URL('https://edore-edu.com'))
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // =============================================
  // サービス公開設定チェック（Roopy English）
  // =============================================
  const englishPaths = ['/english', '/lp/english', '/lp/english-new', '/lp/english-business', '/lp/english-campaign']
  const isEnglishPath = englishPaths.some(path => request.nextUrl.pathname.startsWith(path))
  const isMaintenancePath = request.nextUrl.pathname === '/english/maintenance'

  if (isEnglishPath && !isMaintenancePath) {
    const { data: serviceSetting } = await supabase
      .from('service_settings')
      .select('is_public')
      .eq('service_key', 'roopy_english')
      .single()

    if (serviceSetting && !serviceSetting.is_public) {
      const url = request.nextUrl.clone()
      url.pathname = '/english/maintenance'
      return NextResponse.redirect(url)
    }
  }

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
    '/english',  // Roopy Englishホームページ（公開）
    '/english/maintenance',  // Roopy English メンテナンスページ
    '/forgot-password',
    '/reset-password',
    '/company',  // 会社ホームページ（公開）
    '/juku',     // 塾サイトビルダー（公開）
    '/note/login',   // RoopyNote ログイン
    '/note/signup',  // RoopyNote 登録
  ]

  // juku-admin の公開ページ（ログイン/登録/認証コールバック）
  const jukuAdminPublicPaths = [
    '/juku-admin/login',
    '/juku-admin/signup',
    '/juku-admin/auth',
  ]

  const isPublicPath = publicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  ) ||
    jukuAdminPublicPaths.some(path =>
      request.nextUrl.pathname.startsWith(path)
    ) ||
    request.nextUrl.pathname === '/sitemap.xml' ||
    request.nextUrl.pathname === '/robots.txt'

  // juku-admin へのアクセスは認証必須（ログイン/登録ページ除く）
  const isJukuAdminPath = request.nextUrl.pathname.startsWith('/juku-admin')
  const isJukuAdminAuthPath = jukuAdminPublicPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isJukuAdminPath && !isJukuAdminAuthPath && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/juku-admin/login'
    return NextResponse.redirect(url)
  }

  // 認証済みユーザーがjuku-adminログインページにアクセスした場合はダッシュボードへ
  if (isJukuAdminAuthPath && user && !request.nextUrl.pathname.includes('/auth/')) {
    const url = request.nextUrl.clone()
    url.pathname = '/juku-admin'
    return NextResponse.redirect(url)
  }

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

  // RoopyNote: 認証済みユーザーがログイン/登録ページにアクセスした場合は/noteへ
  const noteLoginPaths = ['/note/login', '/note/signup']
  if (user && noteLoginPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/note'
    return NextResponse.redirect(url)
  }

  // RoopyNote: 未認証で/note（ログイン/登録以外）にアクセスした場合は/note/loginへ
  if (!user && request.nextUrl.pathname.startsWith('/note') && !noteLoginPaths.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/note/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
