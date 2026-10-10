import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE_KEY } from '@chup/core/shared';

const REDIRECT_PATH_COOKIE_KEY = 'chup_redirect_path';
const REDIRECT_PATH_MAX_AGE = 60 * 10;

// RSC·prefetch 같은 fetch 요청은 `sec-fetch-dest: empty`로 들어오므로 문서 이동만 걸러낸다
const isDocumentRequest = (request: NextRequest) =>
  request.headers.get('sec-fetch-dest') !== 'empty';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_KEY);

  if (!hasSession) {
    if (pathname === '/signin') return NextResponse.next();

    const response = NextResponse.redirect(new URL('/signin', request.url));

    // 외부 링크(Discord 알림 등)로 들어온 경로를 기억했다가 로그인 후 되돌려 보낸다
    if (pathname !== '/' && isDocumentRequest(request)) {
      response.cookies.set(REDIRECT_PATH_COOKIE_KEY, `${pathname}${search}`, {
        httpOnly: true,
        maxAge: REDIRECT_PATH_MAX_AGE,
        path: '/',
        sameSite: 'lax',
      });
    }

    return response;
  }

  const redirectPath = request.cookies.get(REDIRECT_PATH_COOKIE_KEY)?.value;

  if (!redirectPath || !isDocumentRequest(request)) return NextResponse.next();

  const redirectUrl = new URL(redirectPath, request.url);
  const isSameOrigin = redirectUrl.origin === request.nextUrl.origin;
  const isCurrentPath = redirectUrl.pathname === pathname && redirectUrl.search === search;
  const response =
    isSameOrigin && !isCurrentPath ? NextResponse.redirect(redirectUrl) : NextResponse.next();

  response.cookies.delete(REDIRECT_PATH_COOKIE_KEY);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
