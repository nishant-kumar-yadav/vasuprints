import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session';

/**
 * Admin gate: unauthenticated requests to /admin/* go to the login page with a `next` back-link.
 * The (panel) layout and every action/route re-check the session; this is the friendly first line.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname === '/admin/login') return withNoIndex(NextResponse.next());
  const ok = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return withNoIndex(NextResponse.redirect(url));
  }
  return withNoIndex(NextResponse.next());
}

function withNoIndex(res: NextResponse) {
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('Cache-Control', 'private, no-store');
  return res;
}

export const config = { matcher: ['/admin', '/admin/:path*'] };
