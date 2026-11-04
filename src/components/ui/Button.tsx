import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'outline-inverse' | 'ghost' | 'link' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'group/btn inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-(--ease-out) active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 select-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-teal-500 text-navy-900 hover:bg-teal-400 active:bg-teal-600',
  secondary: 'bg-navy-800 text-white hover:bg-navy-600 active:bg-navy-900',
  outline: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-800 hover:bg-navy-50 active:bg-navy-100',
  'outline-inverse': 'border border-white/40 text-white hover:bg-white/10 hover:border-white/70',
  ghost: 'text-navy-800 hover:bg-navy-50',
  link: 'text-teal-700 underline-offset-4 hover:text-teal-800 hover:underline px-0! h-auto!',
  whatsapp: 'border border-navy-200 bg-white text-navy-800 hover:border-navy-800 hover:bg-navy-50 active:bg-navy-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-3.5 text-sm rounded-md',
  md: 'h-11 px-[18px] text-[15px] rounded-md',
  lg: 'h-13 px-6 text-base rounded-md',
};

interface CommonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Show the trailing arrow that nudges on hover. */
  arrow?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

function Inner({ arrow, icon, loading, children }: Pick<CommonProps, 'arrow' | 'icon' | 'loading' | 'children'>) {
  return (
    <>
      {loading ? <Loader2 className="size-[18px] animate-spin" aria-hidden /> : icon}
      <span>{children}</span>
      {arrow ? (
        <ArrowRight
          className="size-[18px] transition-transform duration-150 group-hover/btn:translate-x-0.5"
          strokeWidth={2}
          aria-hidden
        />
      ) : null}
    </>
  );
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = CommonProps & Omit<ComponentProps<'button'>, 'children' | 'className'>;

export function Button({ variant, size, arrow, icon, loading, className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={buttonClasses(variant, size, className)}
      aria-busy={loading || undefined}
      disabled={rest.disabled || loading}
      {...rest}
    >
      <Inner arrow={arrow} icon={icon} loading={loading}>
        {children}
      </Inner>
    </button>
  );
}

type LinkButtonProps = CommonProps & { href: string; external?: boolean } & Omit<
    ComponentProps<'a'>,
    'children' | 'className' | 'href'
  >;

export function LinkButton({ variant, size, arrow, icon, className, children, href, external, ...rest }: LinkButtonProps) {
  const cls = buttonClasses(variant, size, className);
  const isExternal = external ?? /^(https?:|mailto:|tel:)/.test(href);
  if (isExternal) {
    const newTab = href.startsWith('http');
    return (
      <a href={href} className={cls} {...(newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})} {...rest}>
        <Inner arrow={arrow} icon={icon}>
          {children}
        </Inner>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      <Inner arrow={arrow} icon={icon}>
        {children}
      </Inner>
    </Link>
  );
}
