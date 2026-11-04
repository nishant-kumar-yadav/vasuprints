import Link from 'next/link';
import { LinkButton } from '@/components/ui/Button';
import { Footer } from '@/components/site/Footer';
import { Logo } from '@/components/site/Logo';
import { DielineFrame } from '@/components/site/motifs/Motifs';
import { categories } from '@/lib/catalog';

export const metadata = { title: 'Page not found', robots: { index: false } };

export default function NotFound() {
  return (
    <>
      <header className="border-b border-border">
        <div className="container-site flex h-16 items-center lg:h-[76px]">
          <Logo />
        </div>
      </header>
      <main id="main" className="section-y">
        <div className="container-narrow text-center">
          <DielineFrame className="mx-auto h-auto w-full max-w-[320px]" />
          <h1 className="text-h1 mt-10 text-navy-900">This page didn&apos;t make the cut</h1>
          <p className="text-lead mx-auto mt-4 max-w-[48ch] text-text-secondary">
            The page you&apos;re looking for may have moved or no longer exists. Try one of our product categories below.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/" size="lg" arrow>
              Go to homepage
            </LinkButton>
            <LinkButton href="/#products" size="lg" variant="outline">
              Browse products
            </LinkButton>
          </div>
          <ul className="mt-12 flex flex-wrap justify-center gap-2 border-t border-border pt-8">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="inline-flex h-10 items-center rounded-full border border-border px-4 text-[15px] font-medium text-navy-800 hover:border-navy-800 hover:bg-navy-50">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
