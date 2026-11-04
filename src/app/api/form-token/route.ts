import { json } from '@/lib/http';
import { issueFormToken } from '@/lib/security/form-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export function GET() {
  return json({ token: issueFormToken() });
}
