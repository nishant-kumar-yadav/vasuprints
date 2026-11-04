'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertCircle, ArrowLeft, Copy, ExternalLink, Lock, Trash2, Unlock } from 'lucide-react';
import { deleteProduct, duplicateProduct, saveProduct } from '@/app/admin/(panel)/products/actions';
import { Button } from '@/components/ui/Button';
import type { Product } from '@/schemas/catalog';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../Toaster';
import { PublishBadge } from '../ui';
import { Field, IconPicker, ImageManager, Repeat, Section, SeoPreview, Select, TagInput, Toggle, slugify, type Errors } from './kit';
import { useEditor } from './useEditor';
import { fieldLabel } from './labels';

export type ProductForm = Omit<Product, 'status'>;

const sections = [
  ['basics', 'Basics'],
  ['content', 'Content'],
  ['features', 'Features'],
  ['specs', 'Specifications'],
  ['options', 'Options'],
  ['faqs', 'FAQs'],
  ['images', 'Images'],
  ['quote', 'Quote form hints'],
  ['seo', 'SEO'],
] as const;

/** Drop rows the editor left completely empty so they don't fail validation. */
function clean(p: ProductForm): ProductForm {
  return {
    ...p,
    intro: p.intro.filter((s) => s.trim()),
    features: p.features.filter((f) => f.title.trim() || f.body.trim()),
    specs: p.specs.filter((s) => s.label.trim() || s.value.trim()),
    faqs: p.faqs.filter((f) => f.q.trim() || f.a.trim()),
  };
}

export function ProductEditor({
  id,
  initial,
  status: initialStatus,
  categories,
  productSlugs,
}: {
  id: string | null;
  initial: ProductForm;
  status: 'draft' | 'published';
  categories: { slug: string; name: string }[];
  productSlugs: string[];
}) {
  const router = useRouter();
  const toast = useToast();
  const { value: p, setValue, set, errors, setErrors, dirty, markSaved } = useEditor<ProductForm>(initial);
  const [status, setStatus] = useState(initialStatus);
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [summary, setSummary] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const e = (k: string) => errors[k];

  const submit = (intent: 'save' | 'publish' | 'unpublish') =>
    start(async () => {
      const data = clean(p);
      const r = await saveProduct({ id, intent, data });
      if (!r.ok) {
        setErrors(r.fields ?? {});
        setSummary(r.error);
        toast(r.error, 'error');
        requestAnimationFrame(() => document.getElementById('editor-top')?.scrollIntoView({ behavior: 'smooth' }));
        return;
      }
      setErrors({});
      setSummary(null);
      setValue(data);
      markSaved(data);
      setStatus(r.data.status);
      setSlugLocked(true);
      toast(intent === 'publish' ? 'Published — the page is live' : intent === 'unpublish' ? 'Unpublished — the page is hidden' : 'Saved');
      if (!id) router.replace(`/admin/products/${r.data.id}`);
      else router.refresh();
    });

  const errorList = Object.entries(errors);

  return (
    <div id="editor-top" className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Link href="/admin/products" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-navy-900">
            <ArrowLeft className="size-4" aria-hidden /> All products
          </Link>
          <h1 className="truncate font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{p.name || 'New product'}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-text-secondary">
            <PublishBadge status={status} />
            {dirty ? <span className="text-warning">Unsaved changes</span> : null}
          </div>
        </div>
      </div>

      {summary ? (
        <div role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <AlertCircle className="size-5" aria-hidden />
            {summary}
          </p>
          {errorList.length ? (
            <ul className="mt-2 list-disc pl-11 text-[15px] text-text-secondary">
              {errorList.slice(0, 8).map(([k, m]) => (
                <li key={k}>
                  <span className="font-medium text-navy-900">{fieldLabel(k)}</span> — {m}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section id="basics" title="Basics">
            <div className="grid gap-5 md:grid-cols-2">
              <Field
                id="name"
                label="Product name"
                value={p.name}
                max={60}
                error={e('name')}
                onChange={(name) => setValue((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugify(name) }))}
              />
              <Select
                id="category"
                label="Category"
                value={p.category}
                error={e('category')}
                onChange={(v) => set('category', v)}
                options={[{ value: '', label: 'Choose a category' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))]}
              />
            </div>
            <Field
              id="slug"
              label="URL"
              prefix="vasuprint.com/"
              value={p.slug}
              disabled={slugLocked}
              error={e('slug')}
              help={id ? 'Changing the URL of a published product creates a permanent redirect from the old one.' : 'Lowercase letters, numbers and hyphens.'}
              onChange={(v) => {
                setSlugTouched(true);
                set('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
              trailing={
                id ? (
                  <button
                    type="button"
                    onClick={() => setSlugLocked((l) => !l)}
                    aria-label={slugLocked ? 'Unlock URL to edit' : 'Lock URL'}
                    className="inline-flex size-9 items-center justify-center rounded-md text-navy-400 hover:bg-surface hover:text-navy-900"
                  >
                    {slugLocked ? <Lock className="size-4" aria-hidden /> : <Unlock className="size-4" aria-hidden />}
                  </button>
                ) : undefined
              }
            />
            <Field id="heading" label="Page heading (H1)" value={p.heading} max={90} error={e('heading')} onChange={(v) => set('heading', v)} />
            <Field id="summary" label="Summary" multiline rows={2} value={p.summary} max={220} error={e('summary')} help="Shown under the heading and on product cards." onChange={(v) => set('summary', v)} />
            <Toggle id="featured" label="Featured on the home page" checked={p.featured} onChange={(v) => set('featured', v)} />
          </Section>

          <Section id="content" title="Content" description="1–4 short paragraphs introducing the product.">
            <Repeat
              items={p.intro}
              onChange={(v) => set('intro', v)}
              make={() => ''}
              max={4}
              addLabel="Add paragraph"
              error={e('intro')}
              render={(text, setText, i) => <Field id={`intro-${i}`} label={`Paragraph ${i + 1}`} multiline rows={4} value={text} max={800} error={e(`intro.${i}`)} onChange={setText} />}
            />
          </Section>

          <Section id="features" title="Features" description="3–6 reasons to choose this product.">
            <Repeat
              items={p.features}
              onChange={(v) => set('features', v)}
              make={() => ({ icon: 'BadgeCheck', title: '', body: '' })}
              max={6}
              addLabel="Add feature"
              error={e('features')}
              render={(f, setF, i) => (
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <IconPicker id={`feature-${i}-icon`} value={f.icon} onChange={(icon) => setF({ ...f, icon })} />
                  <Field id={`feature-${i}-title`} label="Title" value={f.title} max={60} error={e(`features.${i}.title`)} onChange={(title) => setF({ ...f, title })} />
                  <div className="md:col-span-2">
                    <Field id={`feature-${i}-body`} label="Description" multiline rows={2} value={f.body} max={240} error={e(`features.${i}.body`)} onChange={(body) => setF({ ...f, body })} />
                  </div>
                </div>
              )}
            />
          </Section>

          <Section id="specs" title="Specifications" description="3–12 label / value rows for the spec table.">
            <Repeat
              items={p.specs}
              onChange={(v) => set('specs', v)}
              make={() => ({ label: '', value: '' })}
              max={12}
              addLabel="Add row"
              error={e('specs')}
              render={(s, setS, i) => (
                <div className="grid gap-3 md:grid-cols-[200px_1fr]">
                  <Field id={`spec-${i}-label`} label="Label" value={s.label} max={40} error={e(`specs.${i}.label`)} onChange={(label) => setS({ ...s, label })} />
                  <Field id={`spec-${i}-value`} label="Value" value={s.value} max={200} error={e(`specs.${i}.value`)} onChange={(value) => setS({ ...s, value })} />
                </div>
              )}
            />
          </Section>

          <Section id="options" title="Options" description="Shown as chips. Press Enter or comma to add.">
            <div className="grid gap-5 md:grid-cols-2">
              <TagInput id="materials" label="Materials" max={12} values={p.options.materials} onChange={(v) => set('options', { ...p.options, materials: v })} />
              <TagInput id="printing" label="Printing" max={10} values={p.options.printing} onChange={(v) => set('options', { ...p.options, printing: v })} />
              <TagInput id="finishes" label="Finishes" max={14} values={p.options.finishes} onChange={(v) => set('options', { ...p.options, finishes: v })} />
              <TagInput id="formats" label="Formats" max={10} values={p.options.formats} onChange={(v) => set('options', { ...p.options, formats: v })} />
            </div>
            <TagInput id="applications" label="Applications" max={12} values={p.applications} error={e('applications')} help="3–12 industries or uses." onChange={(v) => set('applications', v)} />
            <TagInput
              id="related"
              label="Related products"
              max={4}
              values={p.related}
              suggestions={productSlugs.filter((s) => s !== p.slug)}
              error={e('related')}
              help="Product URLs. Left empty, the page fills in products from the same category."
              onChange={(v) => set('related', v)}
            />
          </Section>

          <Section id="faqs" title="FAQs" description="3–8 questions buyers ask. They also appear in Google results.">
            <Repeat
              items={p.faqs}
              onChange={(v) => set('faqs', v)}
              make={() => ({ q: '', a: '' })}
              max={8}
              addLabel="Add question"
              error={e('faqs')}
              render={(f, setF, i) => (
                <div className="flex flex-col gap-3">
                  <Field id={`faq-${i}-q`} label="Question" value={f.q} max={200} error={e(`faqs.${i}.q`)} onChange={(q) => setF({ ...f, q })} />
                  <Field id={`faq-${i}-a`} label="Answer" multiline rows={3} value={f.a} max={800} error={e(`faqs.${i}.a`)} onChange={(a) => setF({ ...f, a })} />
                </div>
              )}
            />
          </Section>

          <Section id="images" title="Images" description="Up to 6 photos; the first is the cover. Without photos the page shows the brand illustration.">
            <ImageManager images={p.images} onChange={(v) => set('images', v)} max={6} folder="products" errors={errors} errorPrefix="images" />
          </Section>

          <Section id="quote" title="Quote form hints" description="Placeholder examples on the quote form when this product is selected.">
            <div className="grid gap-5 md:grid-cols-3">
              <Field id="hint-size" label="Size" optional value={p.quoteHints.size} max={80} onChange={(v) => set('quoteHints', { ...p.quoteHints, size: v })} />
              <Field id="hint-qty" label="Quantity" optional value={p.quoteHints.quantity} max={80} onChange={(v) => set('quoteHints', { ...p.quoteHints, quantity: v })} />
              <Field id="hint-material" label="Material" optional value={p.quoteHints.material} max={80} onChange={(v) => set('quoteHints', { ...p.quoteHints, material: v })} />
            </div>
          </Section>

          <Section id="seo" title="SEO">
            <Field id="seo-title" label="Title" value={p.seo.title} max={60} error={e('seo.title')} help="The site name is added automatically." onChange={(v) => set('seo', { ...p.seo, title: v })} />
            <Field
              id="seo-description"
              label="Description"
              multiline
              rows={3}
              value={p.seo.description}
              max={170}
              soft={160}
              error={e('seo.description')}
              onChange={(v) => set('seo', { ...p.seo, description: v })}
            />
            <SeoPreview title={p.seo.title ? `${p.seo.title} | VasuPrint` : ''} description={p.seo.description} path={`/${p.slug}`} />
          </Section>
        </div>

        <aside className="xl:sticky xl:top-8 xl:self-start">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-white p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-secondary">Status</span>
              <PublishBadge status={status} />
            </div>
            <div className="flex flex-col gap-2">
              {status === 'draft' ? (
                <>
                  <Button onClick={() => submit('publish')} loading={pending} className="w-full">
                    Publish
                  </Button>
                  <Button variant="outline" onClick={() => submit('save')} disabled={pending} className="w-full">
                    Save draft
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={() => submit('save')} loading={pending} className="w-full">
                    Save changes
                  </Button>
                  <Button variant="outline" onClick={() => submit('unpublish')} disabled={pending} className="w-full">
                    Unpublish
                  </Button>
                </>
              )}
            </div>
            {id && status === 'published' ? (
              <a href={`/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800">
                View live page <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : null}
            <nav aria-label="Sections" className="hidden border-t border-border pt-4 xl:block">
              <ul className="flex flex-col gap-0.5 text-sm">
                {sections.map(([sid, label]) => {
                  const bad = Object.keys(errors).some((k) => k.split('.')[0] === sid || (sid === 'basics' && ['name', 'slug', 'category', 'heading', 'summary'].includes(k.split('.')[0]!)));
                  return (
                    <li key={sid}>
                      <a href={`#${sid}`} className="flex items-center justify-between rounded px-2 py-1.5 text-text-secondary hover:bg-surface hover:text-navy-900">
                        {label}
                        {bad ? <span className="size-2 rounded-full bg-danger" aria-label="has errors" /> : null}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
            {id ? (
              <div className="flex flex-col gap-1 border-t border-border pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Copy className="size-4" aria-hidden />}
                  className="justify-start"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      const r = await duplicateProduct({ id });
                      if (r.ok) {
                        toast('Copy created as a draft');
                        router.push(`/admin/products/${r.data.id}`);
                      } else toast(r.error, 'error');
                    })
                  }
                >
                  Duplicate
                </Button>
                <Button variant="ghost" size="sm" icon={<Trash2 className="size-4" aria-hidden />} className="justify-start text-danger hover:bg-danger/5" onClick={() => setConfirmDelete(true)}>
                  Delete product
                </Button>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {id ? (
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete ${initial.name}?`}
          body="The page is removed and its URL forwards to the category page. This cannot be undone."
          typeToConfirm={initial.slug}
          pending={pending}
          onClose={() => setConfirmDelete(false)}
          onConfirm={(confirm) =>
            start(async () => {
              const r = await deleteProduct({ id, confirm });
              if (r.ok) {
                markSaved(p);
                toast('Product deleted');
                router.replace('/admin/products');
              } else toast(r.error, 'error');
            })
          }
        />
      ) : null}
    </div>
  );
}

export type { Errors };
