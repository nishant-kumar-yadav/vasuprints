import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LogoMark } from '@/components/site/Logo';
import { adminConfigured } from '@/config/env';
import { currentSession } from '@/lib/auth/session';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'Sign in' };
export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const sp = await searchParams;
  const next = typeof sp.next === 'string' && sp.next.startsWith('/admin') ? sp.next : undefined;
  if (await currentSession()) redirect(next ?? '/admin');
  const configured = adminConfigured();
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-xl border border-border bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-xl font-extrabold tracking-[-0.03em]">
            Vasu<span className="text-teal-600">Print</span>
            <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Admin</span>
          </span>
        </div>
        <h1 className="mt-8 font-display text-2xl font-bold">Sign in</h1>
        <div className="mt-6">
          {configured ? (
            <LoginForm next={next} />
          ) : (
            <p className="rounded-md bg-warning/10 p-4 text-[15px] text-navy-900">
              Admin sign-in isn&apos;t configured. Set <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD_HASH</code>,{' '}
              <code>SESSION_SECRET</code> and <code>MONGODB_URI</code>, then restart. See the README.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
