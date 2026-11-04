import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/config/env';
import { apiError } from '@/lib/http';

export const SESSION_COOKIE = 'vp_session';
const LIFETIME_S = 12 * 60 * 60;
const REFRESH_BELOW_S = 2 * 60 * 60;

const key = () => {
  const s = env().SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return new TextEncoder().encode(s);
};

export interface Session {
  sub: 'admin';
  exp: number;
  ver: number;
}

export async function signSession(now = Math.floor(Date.now() / 1000)): Promise<string> {
  return new SignJWT({ ver: env().SESSION_VERSION })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject('admin')
    .setIssuedAt(now)
    .setExpirationTime(now + LIFETIME_S)
    .sign(key());
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  if (!token || !env().SESSION_SECRET) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ['HS256'], subject: 'admin' });
    if (payload.ver !== env().SESSION_VERSION || typeof payload.exp !== 'number') return null;
    return { sub: 'admin', exp: payload.exp, ver: payload.ver };
  } catch {
    return null;
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: env().NODE_ENV === 'production' && env().LOCAL_PREVIEW !== 'true',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: LIFETIME_S,
});

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, await signSession(), cookieOptions());
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function currentSession(): Promise<Session | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/** Pages and layouts: redirect to the login page when there is no valid session. */
export async function requireAdmin(next = '/admin'): Promise<Session> {
  const s = await currentSession();
  if (!s) redirect(`/admin/login?next=${encodeURIComponent(next)}`);
  return s;
}

export class UnauthenticatedError extends Error {
  constructor() {
    super('UNAUTHENTICATED');
  }
}

/** Server Actions: throw (never trust the layout check alone). Slides the session when it is close to expiry. */
export async function requireAdminAction(): Promise<Session> {
  const s = await currentSession();
  if (!s) throw new UnauthenticatedError();
  if (s.exp - Math.floor(Date.now() / 1000) < REFRESH_BELOW_S) {
    try {
      await startSession();
    } catch {
      /* cookies are read-only in some contexts */
    }
  }
  return s;
}

/** Route handlers: a 401 Response, or null when authorised. */
export async function adminApiGuard(req: Request): Promise<Response | null> {
  const token = req.headers
    .get('cookie')
    ?.split(/;\s*/)
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  const s = await verifySession(token);
  return s ? null : apiError(401, 'UNAUTHENTICATED', 'Sign in again.');
}
