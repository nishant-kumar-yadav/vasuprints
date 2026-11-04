import { business, isSet } from '@/config/business';
import { megaPromo } from '@/content/pages/global';
import { Footer } from '@/components/site/Footer';
import { FloatingWhatsApp } from '@/components/site/FloatingWhatsApp';
import { Header } from '@/components/site/Header';
import { RevealObserver } from '@/components/site/Reveal';
import { getCatalog } from '@/lib/catalog';
import { navTree } from '@/lib/nav';
import { JsonLd, organizationLd } from '@/lib/seo';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const catalog = await getCatalog();
  const wa = buildWhatsAppUrl(whatsappTexts.global);
  const phone = isSet(business.phoneDisplay) && isSet(business.phoneE164)
    ? { display: business.phoneDisplay, href: `tel:${business.phoneE164}` }
    : null;
  return (
    <>
      <a
        href="#main"
        className="fixed left-4 top-3 z-50 -translate-y-24 rounded-md bg-navy-900 px-4 py-2.5 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <JsonLd data={organizationLd()} />
      <Header nav={navTree(catalog)} phone={phone} whatsappHref={wa} promo={megaPromo} />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <Footer categories={catalog.categories} />
      <FloatingWhatsApp href={wa} />
      <RevealObserver />
    </>
  );
}
