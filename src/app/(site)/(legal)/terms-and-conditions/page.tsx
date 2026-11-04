import { PolicyPage } from '@/components/policy/PolicyPage';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/terms-and-conditions', { ogKey: 'legal' });

export default function Page() {
  return <PolicyPage slug="terms-and-conditions" />;
}
