'use client';

import { useActionState, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/quote/Field';
import { login, type LoginState } from './actions';

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="flex flex-col gap-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state.error ? (
        <p role="alert" id="login-error" className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 p-3 text-[15px] text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {state.error}
        </p>
      ) : null}
      <TextField id="email" name="email" label="Email" type="email" autoComplete="username" required autoFocus defaultValue={state.email} />
      <div className="relative">
        <TextField id="password" name="password" label="Password" type={show ? 'text' : 'password'} autoComplete="current-password" required />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          className="absolute bottom-1 right-1 inline-flex size-10 items-center justify-center rounded-md text-navy-400 hover:text-navy-900"
        >
          {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>
      <Button type="submit" size="lg" loading={pending} className="w-full">
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
