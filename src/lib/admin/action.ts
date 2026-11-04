import 'server-only';
import { z } from 'zod';
import { UnauthenticatedError, requireAdminAction } from '@/lib/auth/session';

export type ActionResult<T = void> = { ok: true; data: T } | { ok: false; error: string; fields?: Record<string, string> };

export class ActionError extends Error {
  constructor(
    message: string,
    readonly fields?: Record<string, string>,
  ) {
    super(message);
  }
}

/**
 * Wraps every admin Server Action: session check first, then zod parse, then the handler.
 * Unknown errors are logged without input data and reported generically.
 */
export function adminAction<S extends z.ZodType, T>(schema: S, handler: (input: z.output<S>) => Promise<T>) {
  return async (raw: z.input<S>): Promise<ActionResult<T>> => {
    try {
      await requireAdminAction();
    } catch (e) {
      if (e instanceof UnauthenticatedError) return { ok: false, error: 'Your session has expired. Sign in again.' };
      throw e;
    }
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const i of parsed.error.issues) fields[i.path.join('.') || 'form'] ??= i.message;
      return { ok: false, error: 'Please fix the highlighted fields.', fields };
    }
    try {
      return { ok: true, data: await handler(parsed.data) };
    } catch (e) {
      if (e instanceof ActionError) return { ok: false, error: e.message, ...(e.fields ? { fields: e.fields } : {}) };
      // Rethrow Next.js control-flow errors (redirect/notFound).
      if (e && typeof e === 'object' && 'digest' in e) throw e;
      console.error('[admin] action failed:', (e as Error).message);
      return { ok: false, error: 'Something went wrong. Please try again.' };
    }
  };
}
