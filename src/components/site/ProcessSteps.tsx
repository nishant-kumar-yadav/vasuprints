import { process } from '@/content/pages/global';
import { cn } from '@/lib/cn';
import { SectionHeader } from './Section';

/** Five-step process. `dark` = home navy section; `compact` = white strip on category/product pages. */
export function ProcessSteps({ variant = 'dark' }: { variant?: 'dark' | 'compact' }) {
  const dark = variant === 'dark';
  return (
    <section
      className={cn('section-y', dark ? 'bg-navy-800 text-white' : 'border-y border-border bg-white')}
      aria-labelledby="process-title"
    >
      <div className="container-site">
        <SectionHeader
          id="process-title"
          eyebrow={process.eyebrow}
          title={dark ? process.title : 'How ordering works'}
          lead={process.lead}
          align={dark ? 'center' : 'left'}
          inverse={dark}
        />
        <ol className="relative mt-12 grid gap-8 lg:mt-16 lg:grid-cols-5 lg:gap-6">
          {/* Fold line connecting the steps */}
          <span
            aria-hidden
            className={cn(
              'absolute border-dashed',
              'left-5 top-5 bottom-5 border-l-[1.5px] lg:left-[10%] lg:right-[10%] lg:top-5 lg:bottom-auto lg:border-l-0 lg:border-t-[1.5px]',
              dark ? 'border-teal-500/70' : 'border-teal-500/50',
            )}
          />
          {process.steps.map((s, i) => (
            <li
              key={s.title}
              className="relative grid grid-cols-[40px_1fr] gap-x-5 lg:flex lg:flex-col lg:items-center lg:text-center"
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <span
                className={cn(
                  'relative z-10 inline-flex size-10 items-center justify-center rounded-full font-display text-[15px] font-bold',
                  dark ? 'bg-white text-navy-900 ring-8 ring-navy-800' : 'bg-navy-800 text-white ring-8 ring-white',
                )}
              >
                {i + 1}
              </span>
              <div className="lg:mt-5">
                <h3 className={cn('text-h4', dark ? 'text-white' : 'text-navy-900')}>{s.title}</h3>
                <p className={cn('mt-1.5 text-[15px] leading-relaxed', dark ? 'text-navy-100' : 'text-text-secondary')}>
                  {s.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
