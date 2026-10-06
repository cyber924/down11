
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * @fileOverview 도메인별 멀티 테넌트 라우팅 미들웨어 (3개 핵심 도메인 체제)
 * - down1.co.kr -> /news (뉴스 포털)
 * - allmovie.shop -> /blog (블로그)
 * - moviefree.store -> /webzine (웹진)
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get('host') || '').toLowerCase();

  // 1. down1.co.kr 도메인 처리 (신규 포털)
  if (host.includes('down1.co.kr')) {
    if (url.pathname === '/') {
      url.pathname = '/news';
      return NextResponse.rewrite(url);
    }
  }

  // 2. allmovie.shop 도메인 처리 (블로그)
  if (host.includes('allmovie.shop')) {
    if (url.pathname === '/') {
      url.pathname = '/blog';
      return NextResponse.rewrite(url);
    }
  }

  // 3. moviefree.store 도메인 처리 (웹진)
  if (host.includes('moviefree.store')) {
    if (url.pathname === '/') {
      url.pathname = '/webzine';
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
