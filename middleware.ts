import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// サブドメインとパスのマッピング
const SUBDOMAIN_MAP: Record<string, string> = {
  'korean': '/korean',
  // 他のサブドメインがあれば追加
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl.clone()
  const hostname = request.headers.get('host') || ''

  // サブドメインを抽出（例: korean.edore-edu.com → korean）
  // ローカル開発時: korean.localhost:3000 → korean
  const subdomain = hostname.split('.')[0]

  // 本番ドメインまたはlocalhostでない場合はサブドメイン処理
  const isSubdomain =
    subdomain &&
    subdomain !== 'www' &&
    subdomain !== 'edore-edu' &&
    subdomain !== 'localhost' &&
    !hostname.startsWith('192.') &&
    !hostname.startsWith('127.')

  if (isSubdomain && SUBDOMAIN_MAP[subdomain]) {
    const basePath = SUBDOMAIN_MAP[subdomain]

    // API routes should not be rewritten (they already include the subdomain path)
    if (url.pathname.startsWith('/api/')) {
      return await updateSession(request)
    }

    // すでにベースパスが含まれている場合はスキップ
    if (!url.pathname.startsWith(basePath)) {
      url.pathname = `${basePath}${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|wav|ogg|m4a|txt)$).*)',
  ],
}
