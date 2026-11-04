'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  INDIAN_STATES,
  compactQuoteSchema,
  emptyQuote,
  formatIndianMobile,
  quoteSchema,
  type QuoteValues,
} from '@/lib/quote';
import { ArtworkPicker, type PickedFile } from './ArtworkPicker';
import { TextArea, TextField, SelectField } from './Field';
import { HandoffPanel } from './HandoffPanel';

export interface QuoteCatalog {
  categories: { slug: string; name: string }[];
  products: { slug: string; name: string; category: string; hints: { size: string; quantity: string; material: string } }[];
}

type Errors = Partial<Record<keyof QuoteValues, string>>;
type Key = keyof QuoteValues;

const NOT_SURE = 'not-sure';
const DRAFT_KEY = 'vp-quote-draft';

const generic = {
  size: 'e.g. 100 × 50 mm or 4 × 2 in',
  quantity: 'e.g. 5,000 pcs',
  material: 'e.g. 350 GSM SBS, white vinyl',
  finishing: 'e.g. matte lamination, spot UV, gold foil on logo',
  city: 'e.g. Pune',
  notes: 'Deadlines, sample requests, reference products…',
};

/** Order in which fields appear, used to focus the first invalid one. */
const fieldOrder: Key[] = ['category', 'product', 'size', 'quantity', 'material', 'finishing', 'name', 'company', 'phone', 'email', 'city', 'state', 'notes', 'consent'];

const labels: Record<Key, string> = {
  category: 'Product category',
  product: 'Product',
  size: 'Required size',
  quantity: 'Required quantity',
  material: 'Material preference',
  finishing: 'Printing & finishing requirements',
  name: 'Full name',
  company: 'Company name',
  phone: 'Mobile / WhatsApp number',
  email: 'Email address',
  city: 'Delivery city',
  state: 'Delivery state',
  notes: 'Additional requirements',
  consent: 'Consent',
};

export function QuoteForm({ catalog, compact = false }: { catalog: QuoteCatalog; compact?: boolean }) {
  const params = useSearchParams();
  const schema = compact ? compactQuoteSchema : quoteSchema;
  const [values, setValues] = useState<QuoteValues>(emptyQuote);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [summary, setSummary] = useState<Key[]>([]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const restored = useRef(false);

  // Pre-selection from ?product= / ?category=, then restore any session draft.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    let next = { ...emptyQuote };
    try {
      const raw = !compact ? sessionStorage.getItem(DRAFT_KEY) : null;
      if (raw) next = { ...next, ...(JSON.parse(raw) as Partial<QuoteValues>), consent: false as unknown as true };
    } catch {
      /* storage unavailable: start empty */
    }
    const ps = params.get('product');
    const cs = params.get('category');
    const prod = ps ? catalog.products.find((p) => p.slug === ps) : undefined;
    if (prod) next = { ...next, category: prod.category, product: prod.slug };
    else if (cs && catalog.categories.some((c) => c.slug === cs)) next = { ...next, category: cs, product: '' };
    setValues(next);
  }, [params, catalog, compact]);

  // Draft persistence (values only, never files).
  useEffect(() => {
    if (compact || !restored.current || done) return;
    try {
      const { consent: _c, ...rest } = values;
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(rest));
    } catch {
      /* ignore */
    }
  }, [values, compact, done]);

  const product = catalog.products.find((p) => p.slug === values.product);
  const category = catalog.categories.find((c) => c.slug === values.category);
  const hints = product?.hints;
  const productOptions = useMemo(
    () => [
      ...catalog.products.filter((p) => p.category === values.category).map((p) => ({ value: p.slug, label: p.name })),
      { value: NOT_SURE, label: 'Not sure / Other' },
    ],
    [catalog.products, values.category],
  );

  const validateField = (key: Key, v: QuoteValues): string | undefined => {
    const shape = schema.shape as Record<string, { safeParse: (x: unknown) => { success: boolean; error?: { issues: { message: string }[] } } }>;
    const s = shape[key];
    if (!s) return undefined;
    const r = s.safeParse(v[key]);
    return r.success ? undefined : r.error?.issues[0]?.message;
  };

  const set = <K extends Key>(key: K, value: QuoteValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'category' && prev.category !== value) next.product = '';
      if (touched[key] || errors[key]) setErrors((e) => ({ ...e, [key]: validateField(key, next) }));
      return next;
    });
  };

  const blur = (key: Key) => {
    setTouched((t) => ({ ...t, [key]: true }));
    if (key === 'phone' && values.phone) setValues((v) => ({ ...v, phone: formatIndianMobile(v.phone) }));
    setErrors((e) => ({ ...e, [key]: validateField(key, values) }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const r = schema.safeParse(values);
    if (!r.success) {
      const errs: Errors = {};
      for (const issue of r.error.issues) {
        const k = issue.path[0] as Key | undefined;
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      const ordered = fieldOrder.filter((k) => errs[k]);
      setSummary(ordered);
      const first = ordered[0];
      requestAnimationFrame(() => {
        summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (first) formRef.current?.querySelector<HTMLElement>(`#${first}`)?.focus({ preventScroll: true });
      });
      return;
    }
    setSubmitting(true);
    setSummary([]);
    setErrors({});
    // Brief pause so the button's loading state is perceptible; then show the hand-off.
    setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 350);
  };

  const field = (key: Key) => ({
    id: key,
    value: values[key] as string,
    error: errors[key],
    onBlur: () => blur(key),
  });

  if (done) {
    return (
      <HandoffPanel
        values={values}
        productName={product?.name}
        categoryName={category?.name}
        fileNames={files.map((f) => f.name)}
        onEdit={() => setDone(false)}
        onSent={() => {
          try {
            sessionStorage.removeItem(DRAFT_KEY);
          } catch {
            /* ignore */
          }
        }}
      />
    );
  }

  const productField = (
    <SelectField
      {...field('product')}
      label={labels.product}
      optional
      placeholder={values.category ? 'Choose a product' : 'Choose a category first'}
      disabled={!values.category}
      options={values.category ? productOptions : []}
      onChange={(e) => set('product', e.target.value)}
    />
  );

  const categoryField = (
    <SelectField
      {...field('category')}
      label={labels.category}
      placeholder="Choose a category"
      options={catalog.categories.map((c) => ({ value: c.slug, label: c.name }))}
      onChange={(e) => set('category', e.target.value)}
    />
  );

  const phoneField = (
    <TextField
      {...field('phone')}
      label={labels.phone}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      prefix="+91"
      placeholder="98765 43210"
      onChange={(e) => set('phone', e.target.value)}
    />
  );

  const consentField = (
    <div className="flex flex-col gap-1.5">
      <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-relaxed text-text-secondary">
        <span className="relative mt-0.5 inline-flex size-5 shrink-0">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            checked={Boolean(values.consent)}
            onChange={(e) => set('consent', e.target.checked as true)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className={cn(
              'peer size-5 cursor-pointer appearance-none rounded border bg-white transition-colors checked:border-teal-500 checked:bg-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500',
              errors.consent ? 'border-danger' : 'border-navy-200',
            )}
          />
          <Check className="pointer-events-none absolute left-[3px] top-[3px] hidden size-3.5 text-navy-900 peer-checked:block" strokeWidth={3} aria-hidden />
        </span>
        <span>
          I agree to VasuPrint contacting me about this enquiry and processing my details as described in the{' '}
          <Link href="/privacy-policy" className="font-medium text-teal-700 underline underline-offset-4 hover:text-teal-800">
            Privacy Policy
          </Link>
          .
        </span>
      </label>
      {errors.consent ? (
        <p id="consent-error" className="flex items-center gap-1.5 pl-8 text-sm text-danger">
          <AlertCircle className="size-4" aria-hidden />
          {errors.consent}
        </p>
      ) : null}
    </div>
  );

  const errorSummary =
    summary.length > 0 ? (
      <div ref={summaryRef} role="alert" className="rounded-lg border border-danger/30 bg-danger/5 p-5" tabIndex={-1}>
        <p className="flex items-center gap-2 font-semibold text-danger">
          <AlertCircle className="size-5" aria-hidden />
          Please check {summary.length === 1 ? 'one field' : `${summary.length} fields`}
        </p>
        <ul className="mt-2 flex flex-col gap-1 pl-7 text-[15px]">
          {summary.map((k) => (
            <li key={k}>
              <a
                href={`#${k}`}
                onClick={(e) => {
                  e.preventDefault();
                  formRef.current?.querySelector<HTMLElement>(`#${k}`)?.focus();
                }}
                className="text-danger underline underline-offset-4"
              >
                {labels[k]}
              </a>
              {errors[k] ? <span className="text-text-secondary"> — {errors[k]}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    ) : null;

  if (compact) {
    return (
      <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
        {errorSummary}
        <TextField {...field('name')} label={labels.name} autoComplete="name" onChange={(e) => set('name', e.target.value)} />
        <div className="grid gap-5 sm:grid-cols-2">
          {phoneField}
          <TextField {...field('email')} label={labels.email} type="email" autoComplete="email" onChange={(e) => set('email', e.target.value)} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {categoryField}
          <TextField {...field('quantity')} label={labels.quantity} placeholder={generic.quantity} onChange={(e) => set('quantity', e.target.value)} />
        </div>
        <TextArea {...field('notes')} label="Message" optional placeholder="Tell us about your product, size and material…" onChange={(e) => set('notes', e.target.value)} />
        {consentField}
        <Button type="submit" size="lg" arrow loading={submitting} className="w-full sm:w-auto sm:self-start">
          {submitting ? 'Preparing…' : 'Send message'}
        </Button>
      </form>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="flex flex-col gap-10">
      {product ? (
        <div className="flex items-center gap-3 self-start rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-2 text-[15px] text-navy-800">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Check className="size-4" strokeWidth={2.5} aria-hidden />
          </span>
          <span>
            Requesting a quote for <strong className="font-semibold text-navy-900">{product.name}</strong>
          </span>
          <button
            type="button"
            onClick={() => set('product', '')}
            aria-label={`Remove ${product.name}`}
            className="inline-flex size-8 items-center justify-center rounded-full text-navy-400 hover:bg-white hover:text-navy-900"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {errorSummary}

      <Fieldset n={1} legend="Product details">
        <div className="grid gap-5 md:grid-cols-2">
          {categoryField}
          {productField}
          <TextField {...field('size')} label={labels.size} optional placeholder={hints?.size ?? generic.size} onChange={(e) => set('size', e.target.value)} />
          <TextField {...field('quantity')} label={labels.quantity} placeholder={hints?.quantity ?? generic.quantity} onChange={(e) => set('quantity', e.target.value)} />
        </div>
        <TextField {...field('material')} label={labels.material} optional placeholder={hints?.material ?? generic.material} onChange={(e) => set('material', e.target.value)} />
        <TextArea {...field('finishing')} label={labels.finishing} optional rows={3} placeholder={generic.finishing} onChange={(e) => set('finishing', e.target.value)} />
      </Fieldset>

      <Fieldset n={2} legend="Artwork" optional>
        <ArtworkPicker files={files} onChange={setFiles} />
      </Fieldset>

      <Fieldset n={3} legend="Your details">
        <div className="grid gap-5 md:grid-cols-2">
          <TextField {...field('name')} label={labels.name} autoComplete="name" onChange={(e) => set('name', e.target.value)} />
          <TextField {...field('company')} label={labels.company} optional autoComplete="organization" onChange={(e) => set('company', e.target.value)} />
          {phoneField}
          <TextField {...field('email')} label={labels.email} type="email" autoComplete="email" onChange={(e) => set('email', e.target.value)} />
          <TextField {...field('city')} label={labels.city} autoComplete="address-level2" placeholder={generic.city} onChange={(e) => set('city', e.target.value)} />
          <SelectField
            {...field('state')}
            label={labels.state}
            placeholder="Choose a state"
            options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
            onChange={(e) => set('state', e.target.value)}
          />
        </div>
        <TextArea {...field('notes')} label={labels.notes} optional placeholder={generic.notes} onChange={(e) => set('notes', e.target.value)} />
        {consentField}
      </Fieldset>

      <div className="border-t border-border pt-8">
        <Button type="submit" size="lg" arrow loading={submitting} className="w-full sm:w-auto">
          {submitting ? 'Sending…' : 'Request a Quote'}
        </Button>
      </div>
    </form>
  );
}

function Fieldset({ n, legend, optional, children }: { n: number; legend: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5">
      <legend className="mb-5 flex w-full items-center gap-3 border-b border-border pb-4">
        <span className="inline-flex size-8 items-center justify-center rounded-full bg-navy-800 font-display text-sm font-bold text-white">
          {n}
        </span>
        <span className="font-display text-xl font-bold tracking-[-0.015em] text-navy-900">
          {legend}
          {optional ? <span className="ml-1.5 font-sans text-sm font-normal text-text-muted">(optional)</span> : null}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}
