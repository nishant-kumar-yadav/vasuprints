'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { Turnstile } from './Turnstile';
import { readSource } from '@/lib/client/source';
import { track } from '@/lib/client/track';

export interface QuoteCatalog {
  categories: { slug: string; name: string }[];
  products: {
    slug: string;
    name: string;
    category: string;
    hints: { size: string; quantity: string; material: string };
    image: string | null;
  }[];
}

/** Server field names → form field names, for mapping API validation errors. */
const serverToForm: Record<string, Key> = {
  name: 'name',
  company: 'company',
  phone: 'phone',
  email: 'email',
  categorySlug: 'category',
  productSlug: 'product',
  size: 'size',
  quantity: 'quantity',
  material: 'material',
  finishing: 'finishing',
  deliveryCity: 'city',
  deliveryState: 'state',
  additional: 'notes',
  consent: 'consent',
};

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

export interface QuoteFormProps {
  catalog: QuoteCatalog;
  compact?: boolean;
  /** Submit to /api/quotes (P2). Off → hand-off to WhatsApp/email (P1). */
  backend?: boolean;
  turnstileSiteKey?: string | null;
}

export function QuoteForm({ catalog, compact = false, backend = false, turnstileSiteKey = null }: QuoteFormProps) {
  const params = useSearchParams();
  const router = useRouter();
  const schema = compact ? compactQuoteSchema : quoteSchema;
  const [values, setValues] = useState<QuoteValues>(emptyQuote);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Key, boolean>>>({});
  const [summary, setSummary] = useState<Key[]>([]);
  const [files, setFiles] = useState<PickedFile[]>([]);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  /** Set when the API could not take the request: we fall back to the WhatsApp/email hand-off. */
  const [offline, setOffline] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileReset, setTurnstileReset] = useState(0);
  const formToken = useRef<string | null>(null);
  const website = useRef<HTMLInputElement>(null);
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

  // Timing token for the bot heuristics (issued when the form is first shown).
  useEffect(() => {
    if (!backend) return;
    fetch('/api/form-token', { cache: 'no-store' })
      .then((r) => (r.ok ? (r.json() as Promise<{ token: string }>) : null))
      .then((d) => {
        if (d) formToken.current = d.token;
      })
      .catch(() => undefined);
  }, [backend]);

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
    setSummary([]);
    setErrors({});
    setFormError(null);
    if (!backend) {
      setSubmitting(true);
      // Brief pause so the button's loading state is perceptible; then show the hand-off.
      setTimeout(() => {
        setSubmitting(false);
        setDone(true);
      }, 350);
      return;
    }
    if (files.some((f) => f.status === 'queued' || f.status === 'uploading')) {
      setFormError('Please wait for your files to finish uploading.');
      return;
    }
    if (files.some((f) => f.status === 'error')) {
      setFormError('One of your files did not upload. Retry it or remove it to continue.');
      return;
    }
    if (turnstileSiteKey && !turnstileToken) {
      setFormError('Verifying you are human… please try again in a moment.');
      return;
    }
    void submitToApi();
  };

  const submitToApi = async () => {
    setSubmitting(true);
    const payload = {
      kind: compact ? 'message' : 'quote',
      name: values.name,
      company: values.company ?? '',
      phone: values.phone,
      email: values.email,
      categorySlug: values.category,
      productSlug: values.product && values.product !== NOT_SURE ? values.product : null,
      size: values.size ?? '',
      quantity: values.quantity,
      material: values.material ?? '',
      finishing: values.finishing ?? '',
      deliveryCity: compact ? '' : values.city,
      deliveryState: compact ? '' : values.state,
      additional: values.notes ?? '',
      uploadIds: files.flatMap((f) => (f.uploadId ? [f.uploadId] : [])),
      consent: values.consent,
      turnstileToken: turnstileToken ?? undefined,
      formToken: formToken.current ?? undefined,
      website: website.current?.value ?? '',
      source: readSource(),
    };
    let res: Response;
    try {
      res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      setSubmitting(false);
      setOffline(true);
      setDone(true);
      return;
    }
    const body = (await res.json().catch(() => null)) as
      | { reference?: string; error?: { code: string; message: string; fields?: Record<string, string> } }
      | null;
    if (res.status === 201 && body?.reference) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignore */
      }
      track('generate_lead', { form: compact ? 'contact' : 'quote', category: values.category });
      router.push(`/get-a-quote/thank-you?ref=${encodeURIComponent(body.reference)}${compact ? '&kind=message' : ''}`);
      return;
    }
    setSubmitting(false);
    setTurnstileToken(null);
    setTurnstileReset((n) => n + 1);
    if (res.status === 400 && body?.error?.fields) {
      const errs: Errors = {};
      for (const [k, msg] of Object.entries(body.error.fields)) {
        const fk = serverToForm[k];
        if (fk) errs[fk] ??= msg;
      }
      const ordered = fieldOrder.filter((k) => errs[k]);
      if (ordered.length) {
        setErrors(errs);
        setSummary(ordered);
        requestAnimationFrame(() => summaryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
        return;
      }
    }
    if (res.status >= 500 || res.status === 404) {
      setOffline(true);
      setDone(true);
      return;
    }
    setFormError(body?.error?.message ?? 'Something went wrong. Please try again.');
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
        notice={offline ? "We couldn't send your request online just now, but it's ready to send on WhatsApp or email." : undefined}
        onEdit={() => {
          setDone(false);
          setOffline(false);
        }}
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

  const formAlert = formError ? (
    <p role="alert" className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-4 text-[15px] text-navy-900">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
      {formError}
    </p>
  ) : null;

  // Honeypot: off-screen, unlabeled for humans, skipped by keyboard and assistive tech.
  const honeypot = backend ? (
    <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Website
        <input ref={website} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  ) : null;

  const turnstile = backend && turnstileSiteKey ? <Turnstile siteKey={turnstileSiteKey} onToken={setTurnstileToken} resetKey={turnstileReset} /> : null;
  const uploading = files.some((f) => f.status === 'queued' || f.status === 'uploading');

  if (compact) {
    return (
      <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-col gap-5">
        {honeypot}
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
        {turnstile}
        {formAlert}
        <Button type="submit" size="lg" arrow loading={submitting} className="w-full sm:w-auto sm:self-start">
          {submitting ? (backend ? 'Sending…' : 'Preparing…') : 'Send message'}
        </Button>
      </form>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="relative flex flex-col gap-10">
      {honeypot}
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
        <ArtworkPicker files={files} onChange={setFiles} upload={backend} />
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

      <div className="flex flex-col gap-4 border-t border-border pt-8">
        {turnstile}
        {formAlert}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" size="lg" arrow loading={submitting} className="w-full sm:w-auto">
            {submitting ? 'Sending…' : 'Request a Quote'}
          </Button>
          {uploading ? <span className="text-sm text-text-muted">Uploads in progress — you can submit once they finish.</span> : null}
        </div>
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
