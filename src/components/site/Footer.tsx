import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { business, formatAddress, isSet, show } from '@/config/business';
import { footer } from '@/content/pages/global';
import { buildWhatsAppUrl, telUrl, whatsappTexts } from '@/lib/whatsapp';
import { Logo } from './Logo';
import { WhatsAppIcon } from './icons/WhatsApp';
import { CropMarks } from './motifs/Motifs';

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/#products', label: 'Products' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/get-a-quote', label: 'Get a Quote' },
];

const resources = [
  { href: '/industries', label: 'Industries' },
  { href: '/guides', label: 'Buyer Guides' },
  { href: '/guides/print-ready-artwork-guide', label: 'Artwork Guide' },
  { href: '/guides/dtf-vs-uv-dtf-stickers', label: 'DTF vs UV DTF' },
  { href: '/guides/sbs-vs-duplex-board', label: 'SBS vs Duplex' },
];

const legal = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/shipping-policy', label: 'Shipping Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-eyebrow mb-5 text-teal-300">{children}</h2>;
}

const linkCls = 'inline-flex min-h-8 items-center text-[15px] text-white/80 transition-colors hover:text-white';

export function Footer({ categories }: { categories: { slug: string; name: string }[] }) {
  const tel = telUrl();
  return (
    <footer className="relative overflow-hidden bg-navy-900 pt-16 text-white lg:pt-20">
      <div className="pointer-events-none absolute right-0 top-0 size-72 opacity-15" aria-hidden>
        <CropMarks className="text-teal-300" inset={32} size={32} />
      </div>
      <div className="container-site relative">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <Logo inverse />
            <p className="mt-5 max-w-[32ch] text-[15px] leading-relaxed text-white/70">{footer.brandLine}</p>
            <LinkButton href="/get-a-quote" arrow className="mt-7">
              Get a Quote
            </LinkButton>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5">
            <div>
              <FooterHeading>Quick Links</FooterHeading>
              <ul className="flex flex-col gap-1.5">
                {quickLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <FooterHeading>Our Products</FooterHeading>
              <ul className="flex flex-col gap-1.5">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/${c.slug}`} className={linkCls}>
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <FooterHeading>Resources</FooterHeading>
              <ul className="flex flex-col gap-1.5">
                {resources.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className={linkCls}>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="lg:col-span-3">
            <FooterHeading>Contact Information</FooterHeading>
            <ul className="flex flex-col gap-3 text-[15px] text-white/80">
              <li className="flex items-start gap-3">
                <Phone className="mt-1 size-4 shrink-0 text-teal-300" aria-hidden />
                {tel ? (
                  <a href={tel} className="hover:text-white">
                    {business.phoneDisplay}
                  </a>
                ) : (
                  <span>Phone: {show(business.phoneDisplay)}</span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <Mail className="mt-1 size-4 shrink-0 text-teal-300" aria-hidden />
                {isSet(business.email) ? (
                  <a href={`mailto:${business.email}`} className="break-all hover:text-white">
                    {business.email}
                  </a>
                ) : (
                  <span>Email: —</span>
                )}
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-teal-300" aria-hidden />
                <span>{formatAddress() === '—' ? 'Address: —' : formatAddress()}</span>
              </li>
            </ul>
            <LinkButton
              href={buildWhatsAppUrl(whatsappTexts.global)}
              variant="outline-inverse"
              icon={<WhatsAppIcon />}
              className="mt-6"
            >
              WhatsApp us
            </LinkButton>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/10 py-8 text-sm text-white/60 lg:flex-row lg:items-center lg:justify-between">
          <p>© {new Date().getFullYear()} VasuPrint. All Rights Reserved.</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legal.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="tabular-nums">GSTIN: {show(business.gstin)}</p>
        </div>
      </div>
    </footer>
  );
}
