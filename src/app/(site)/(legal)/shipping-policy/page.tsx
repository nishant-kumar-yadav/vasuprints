import { PolicyPage } from '@/components/policy/PolicyPage';
import { metaFor } from '@/lib/seo';

export const metadata = metaFor('/shipping-policy');

export default function Page() {
  return <PolicyPage slug="shipping-policy" />;
}
