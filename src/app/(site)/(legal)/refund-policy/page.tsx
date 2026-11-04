import { PolicyPage } from '@/components/policy/PolicyPage';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/refund-policy');

export default function Page() {
  return <PolicyPage slug="refund-policy" />;
}
