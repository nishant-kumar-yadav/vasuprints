import { LinkButton } from '@/components/ui/Button';
import { buildWhatsAppUrl, whatsappTexts } from '@/lib/whatsapp';
import { WhatsAppIcon } from './icons/WhatsApp';
import { CropMarks, RegistrationMark } from './motifs/Motifs';

export function CtaBand({
  title,
  text,
  button,
  href = '/get-a-quote',
  whatsappText = whatsappTexts.global,
}: {
  title: string;
  text: string;
  button: string;
  href?: string;
  whatsappText?: string;
}) {
  return (
    <section className="section-y bg-white" aria-labelledby="cta-title">
      <div className="container-site">
        <div
          className="relative isolate overflow-hidden rounded-xl bg-navy-800 px-6 py-14 text-center sm:px-12 lg:py-20"
          data-reveal
        >
          <CropMarks className="text-teal-500/40" inset={20} />
          <RegistrationMark className="absolute -right-6 -top-6 size-40 text-white/[0.04]" />
          <svg aria-hidden className="absolute inset-0 -z-10 size-full opacity-[0.07]" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0 70 L100 30" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" fill="none" vectorEffect="non-scaling-stroke" />
            <path d="M0 85 L100 45" stroke="white" strokeWidth="0.2" strokeDasharray="1 1" fill="none" vectorEffect="non-scaling-stroke" />
          </svg>
          <h2 id="cta-title" className="text-h2 mx-auto max-w-[22ch] text-white">
            {title}
          </h2>
          <p className="text-lead mx-auto mt-4 max-w-[52ch] text-navy-100">{text}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <LinkButton href={href} size="lg" arrow>
              {button}
            </LinkButton>
            <LinkButton
              href={buildWhatsAppUrl(whatsappText)}
              variant="outline-inverse"
              size="lg"
              icon={<WhatsAppIcon className="fill-white" />}
            >
              Chat on WhatsApp
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  );
}
