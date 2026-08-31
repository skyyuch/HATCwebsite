import createMiddleware from 'next-intl/middleware';
import {type NextRequest, NextResponse} from 'next/server';

import {routing} from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const ADMIN_LNG_COOKIE = 'payload-lng';
const ADMIN_DEFAULT_LNG = 'zh-TW';

/**
 * Next.js 16 "proxy" (formerly middleware).
 * - Front-end: next-intl locale routing
 * - /admin: default Payload UI language to Traditional Chinese when the user
 *   has not chosen one yet. Without this, browsers that send Accept-Language: en
 *   keep the admin shell in English even though fallbackLanguage is zh-TW
 *   (Payload prefers a matching Accept-Language over fallback).
 */
export default function proxy(request: NextRequest) {
  const {pathname} = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const existing = request.cookies.get(ADMIN_LNG_COOKIE)?.value;
    if (existing) {
      return NextResponse.next();
    }

    // Inject cookie into the *request* so Payload's getRequestLanguage sees it
    // on this same response (setting only the response cookie would apply next load).
    const requestHeaders = new Headers(request.headers);
    const rawCookie = request.headers.get('cookie') ?? '';
    const nextCookie = rawCookie
      ? `${rawCookie}; ${ADMIN_LNG_COOKIE}=${ADMIN_DEFAULT_LNG}`
      : `${ADMIN_LNG_COOKIE}=${ADMIN_DEFAULT_LNG}`;
    requestHeaders.set('cookie', nextCookie);

    const response = NextResponse.next({
      request: {headers: requestHeaders}
    });
    response.cookies.set({
      name: ADMIN_LNG_COOKIE,
      value: ADMIN_DEFAULT_LNG,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax'
    });
    return response;
  }

  return intlMiddleware(request);
}

export const config = {
  // Include /admin (for default UI language). Still skip Payload API, Next
  // internals, and static files.
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)'
};
