import { Mail, Phone } from 'lucide-react';
import { LinkButton } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/site/icons/WhatsApp';
import { business, isSet } from '@/config/business';
import { buildWhatsAppUrl, telUrl, whatsappTexts } from '@/lib/whatsapp';

export function ContactActions() {
  const tel = telUrl();
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <LinkButton href={buildWhatsAppUrl(whatsappTexts.global)} variant="whatsapp" icon={<WhatsAppIcon />} className={tel ? '' : 'col-span-2'}>
          WhatsApp
        </LinkButton>
        {tel ? (
          <LinkButton href={tel} variant="outline" icon={<Phone className="size-4" aria-hidden />}>
            Call
          </LinkButton>
        ) : null}
      </div>
      {isSet(business.email) ? (
        <a href={`mailto:${business.email}`} className="inline-flex items-center gap-2 text-[15px] text-navy-800 hover:text-teal-700">
          <Mail className="size-4 text-teal-700" aria-hidden />
          {business.email}
        </a>
      ) : null}
    </div>
  );
}
