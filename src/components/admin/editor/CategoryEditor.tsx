'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { AlertCircle, ArrowLeft, ExternalLink, Lock, Trash2, Unlock } from 'lucide-react';
import { deleteCategory, saveCategory } from '@/app/admin/(panel)/categories/actions';
import { Button } from '@/components/ui/Button';
import type { Category } from '@/schemas/catalog';
import { ConfirmDialog } from '../ConfirmDialog';
import { useToast } from '../Toaster';
import { Notice, PublishBadge } from '../ui';
import { Field, IconPicker, ImageManager, MobileSaveBar, Repeat, Section, SeoChecklist, SeoPreview, slugify } from './kit';
import { useEditor } from './useEditor';
import { fieldLabel } from './labels';

export type CategoryForm = Omit<Category, 'status'>;

function clean(c: CategoryForm): CategoryForm {
  return {
    ...c,
    intro: c.intro.filter((s) => s.trim()),
    highlights: c.highlights.filter((f) => f.title.trim() || f.body.trim()),
    faqs: c.faqs.filter((f) => f.q.trim() || f.a.trim()),
  };
}

export function CategoryEditor({ id, initial, status: initialStatus, productCount }: { id: string | null; initial: CategoryForm; status: 'draft' | 'published'; productCount: number }) {
  const router = useRouter();
  const toast = useToast();
  const { value: c, setValue, set, errors, setErrors, dirty, markSaved } = useEditor<CategoryForm>(initial);
  const [status, setStatus] = useState(initialStatus);
  const [slugLocked, setSlugLocked] = useState(Boolean(id));
  const [slugTouched, setSlugTouched] = useState(Boolean(id));
  const [summary, setSummary] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const e = (k: string) => errors[k];

  const submit = (intent: 'save' | 'publish' | 'unpublish') =>
    start(async () => {
      const data = clean(c);
      const r = await saveCategory({ id, intent, data });
      if (!r.ok) {
        setErrors(r.fields ?? {});
        setSummary(r.error);
        toast(r.error, 'error');
        return;
      }
      setErrors({});
      setSummary(null);
      setValue(data);
      markSaved(data);
      setStatus(intent === 'publish' ? 'published' : intent === 'unpublish' ? 'draft' : status);
      setSlugLocked(true);
      toast(intent === 'publish' ? 'Published — the category is live' : intent === 'unpublish' ? 'Unpublished — the category and its products are hidden' : 'Saved');
      if (!id) router.replace(`/admin/categories/${r.data.id}`);
      else router.refresh();
    });

  return (
    <div>
      <Link href="/admin/categories" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-navy-900">
        <ArrowLeft className="size-4" aria-hidden /> All categories
      </Link>
      <h1 className="font-display text-[1.75rem] font-bold leading-tight tracking-[-0.02em]">{c.name || 'New category'}</h1>
      <div className="mb-6 mt-2 flex items-center gap-2 text-sm">
        <PublishBadge status={status} />
        {dirty ? <span className="text-warning">Unsaved changes</span> : null}
      </div>

      {summary ? (
        <div role="alert" className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <AlertCircle className="size-5" aria-hidden />
            {summary}
          </p>
          <ul className="mt-2 list-disc pl-11 text-[15px] text-text-secondary">
            {Object.entries(errors)
              .slice(0, 8)
              .map(([k, m]) => (
                <li key={k}>
                  <span className="font-medium text-navy-900">{fieldLabel(k)}</span> — {m}
                </li>
              ))}
          </ul>
        </div>
      ) : null}

      {!id ? <div className="mb-6"><Notice>New published categories appear in the header menu, footer and home page. Five categories fill the home page bento layout exactly; other counts use a grid.</Notice></div> : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          <Section id="basics" title="Basics">
            <Field id="name" label="Category name" value={c.name} max={40} error={e('name')} help="Used in the menu, so keep it short." onChange={(name) => setValue((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugify(name) }))} />
            <Field
              id="slug"
              label="URL"
              prefix="vasuprint.com/"
              value={c.slug}
              disabled={slugLocked}
              error={e('slug')}
              help={id ? 'Changing it moves every product in this category and redirects the old URL.' : undefined}
              onChange={(v) => {
                setSlugTouched(true);
                set('slug', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'));
              }}
              trailing={
                id ? (
                  <button type="button" onClick={() => setSlugLocked((l) => !l)} aria-label={slugLocked ? 'Unlock URL to edit' : 'Lock URL'} className="inline-flex size-9 items-center justify-center rounded-md text-navy-400 hover:bg-surface hover:text-navy-900">
                    {slugLocked ? <Lock className="size-4" aria-hidden /> : <Unlock className="size-4" aria-hidden />}
                  </button>
                ) : undefined
              }
            />
            <Field id="heading" label="Page heading (H1)" value={c.heading} max={90} error={e('heading')} onChange={(v) => set('heading', v)} />
            <Field id="tagline" label="Tagline" value={c.tagline} max={140} error={e('tagline')} help="One line under the heading and on category cards." onChange={(v) => set('tagline', v)} />
          </Section>

          <Section id="intro" title="Introduction" description="1–4 paragraphs.">
            <Repeat items={c.intro} onChange={(v) => set('intro', v)} make={() => ''} max={4} addLabel="Add paragraph" error={e('intro')} render={(t, setT, i) => <Field id={`intro-${i}`} label={`Paragraph ${i + 1}`} multiline rows={4} value={t} max={600} error={e(`intro.${i}`)} onChange={setT} />} />
          </Section>

          <Section id="highlights" title="Highlights" description="Up to 6 short reasons shown on the category page.">
            <Repeat
              items={c.highlights}
              onChange={(v) => set('highlights', v)}
              make={() => ({ icon: 'BadgeCheck', title: '', body: '' })}
              max={6}
              addLabel="Add highlight"
              render={(f, setF, i) => (
                <div className="grid gap-3 md:grid-cols-[220px_1fr]">
                  <IconPicker id={`hl-${i}-icon`} value={f.icon} onChange={(icon) => setF({ ...f, icon })} />
                  <Field id={`hl-${i}-title`} label="Title" value={f.title} max={60} error={e(`highlights.${i}.title`)} onChange={(title) => setF({ ...f, title })} />
                  <div className="md:col-span-2">
                    <Field id={`hl-${i}-body`} label="Description" multiline rows={2} value={f.body} max={240} error={e(`highlights.${i}.body`)} onChange={(body) => setF({ ...f, body })} />
                  </div>
                </div>
              )}
            />
          </Section>

          <Section id="faqs" title="FAQs">
            <Repeat
              items={c.faqs}
              onChange={(v) => set('faqs', v)}
              make={() => ({ q: '', a: '' })}
              max={8}
              addLabel="Add question"
              render={(f, setF, i) => (
                <div className="flex flex-col gap-3">
                  <Field id={`faq-${i}-q`} label="Question" value={f.q} max={200} error={e(`faqs.${i}.q`)} onChange={(q) => setF({ ...f, q })} />
                  <Field id={`faq-${i}-a`} label="Answer" multiline rows={3} value={f.a} max={800} error={e(`faqs.${i}.a`)} onChange={(a) => setF({ ...f, a })} />
                </div>
              )}
            />
          </Section>

          <Section id="image" title="Cover image" description="Optional. Without it the brand illustration is used.">
            <ImageManager images={c.image ? [c.image] : []} onChange={(v) => set('image', v[0] ?? null)} max={1} folder="categories" errors={errors} errorPrefix="image" />
          </Section>

          <Section id="seo" title="SEO">
            <Field id="seo-title" label="Title" value={c.seo.title} max={60} error={e('seo.title')} onChange={(v) => set('seo', { ...c.seo, title: v })} />
            <Field id="seo-description" label="Description" multiline rows={3} value={c.seo.description} max={170} soft={160} error={e('seo.description')} onChange={(v) => set('seo', { ...c.seo, description: v })} />
            <SeoPreview title={c.seo.title ? `${c.seo.title} | VasuPrint` : ''} description={c.seo.description} path={`/${c.slug}`} />
            <SeoChecklist
              input={{
                keyword: c.name,
                slug: c.slug,
                title: c.seo.title,
                description: c.seo.description,
                heading: c.heading,
                intro: c.intro,
                body: [c.tagline, ...c.highlights.flatMap((f) => [f.title, f.body]), ...c.faqs.flatMap((f) => [f.q, f.a])],
                imageAlts: c.image ? [c.image.alt] : [],
                faqCount: c.faqs.filter((f) => f.q.trim()).length,
              }}
            />
          </Section>
        </div>

        <aside aria-label="Publishing" className="xl:sticky xl:top-8 xl:self-start">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
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
            {id && status === 'published' ? (
              <a href={`/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800">
                View live page <ExternalLink className="size-3.5" aria-hidden />
              </a>
            ) : null}
            {id ? (
              <div className="border-t border-border pt-3">
                <Button variant="ghost" size="sm" icon={<Trash2 className="size-4" aria-hidden />} className="justify-start text-danger hover:bg-danger/5" onClick={() => setConfirmDelete(true)} disabled={productCount > 0}>
                  Delete category
                </Button>
                {productCount > 0 ? <p className="mt-1 text-xs text-text-muted">Move or delete its {productCount} products first.</p> : null}
              </div>
            ) : null}
          </div>
        </aside>
      </div>
      <MobileSaveBar dirty={dirty} pending={pending} draft={status === 'draft'} onSave={() => submit('save')} />

      {id ? (
        <ConfirmDialog
          open={confirmDelete}
          title={`Delete ${initial.name}?`}
          body="The category page is removed. This cannot be undone."
          typeToConfirm={initial.slug}
          pending={pending}
          onClose={() => setConfirmDelete(false)}
          onConfirm={(confirm) =>
            start(async () => {
              const r = await deleteCategory({ id, confirm });
              if (r.ok) {
                markSaved(c);
                toast('Category deleted');
                router.replace('/admin/categories');
              } else toast(r.error, 'error');
            })
          }
        />
      ) : null}
    </div>
  );
}
