'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { adminConfigured } from '@/config/env';
import { checkAdminCredentials } from '@/lib/auth/password';
import { startSession } from '@/lib/auth/session';
import { clientIp, hashIp } from '@/lib/security/ip';
import { limits } from '@/lib/security/rate-limit';

export interface LoginState {
  error?: string;
  /** Echoed back so React's post-action form reset keeps what was typed. */
  email?: string;
}

const input = z.object({
  email: z.string().trim().max(200),
  password: z.string().max(200),
  next: z.string().max(300).optional(),
});

const GLOBAL = 'global';

/** Only same-site admin paths; anything else falls back to the dashboard. */
function safeNext(next: string | undefined) {
  if (!next || !next.startsWith('/admin') || next.startsWith('//') || next.includes('\\')) return '/admin';
  return next;
}

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  if (!adminConfigured()) return { error: 'Admin sign-in is not configured on this server.' };
  const parsed = input.safeParse({ email: form.get('email'), password: form.get('password'), next: form.get('next') ?? undefined });
  if (!parsed.success) return { error: 'Email or password is incorrect.' };
  const email = parsed.data.email;

  const ipHash = hashIp(clientIp(await headers()));
  if (limits.loginGlobalFailures.blocked(GLOBAL)) {
    console.warn('[auth] login locked: too many failures in 24 h');
    return { error: 'Sign-in is temporarily locked. Try again in an hour.', email };
  }
  const rl = limits.loginPerIp.hit(ipHash);
  if (!rl.ok) return { error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfter / 60)} minutes.`, email };

  const ok = await checkAdminCredentials(parsed.data.email, parsed.data.password);
  if (!ok) {
    limits.loginGlobalFailures.hit(GLOBAL);
    console.warn('[auth] failed login');
    return { error: 'Email or password is incorrect.', email };
  }
  limits.loginPerIp.reset(ipHash);
  await startSession();
  console.info('[auth] admin signed in');
  redirect(safeNext(parsed.data.next));
}
