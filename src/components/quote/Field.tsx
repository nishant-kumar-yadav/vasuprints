import { AlertCircle, ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

const control =
  'w-full rounded-md border bg-white px-3.5 text-base text-navy-900 shadow-xs transition-[border-color,box-shadow] duration-150 placeholder:text-text-muted focus:outline-none focus-visible:outline-none';
const ok = 'border-border hover:border-navy-200 focus:border-teal-500 focus:ring-[3px] focus:ring-teal-100';
const bad = 'border-danger focus:ring-[3px] focus:ring-danger/15';

interface FieldShell {
  id: string;
  label: string;
  optional?: boolean;
  help?: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FieldShell({ id, label, optional, help, error, className, children }: FieldShell) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-navy-900">
        {label}
        {optional ? <span className="font-normal text-text-muted"> (optional)</span> : null}
      </label>
      {children}
      {help && !error ? (
        <p id={`${id}-help`} className="text-sm text-text-secondary">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, help?: ReactNode) {
  return error ? `${id}-error` : help ? `${id}-help` : undefined;
}

type InputProps = Omit<FieldShell, 'children'> & ComponentProps<'input'> & { prefix?: string };

export function TextField({ id, label, optional, help, error, className, prefix, ...rest }: InputProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} help={help} error={error} className={className}>
      <div className="relative">
        {prefix ? (
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center border-r border-border pl-3.5 pr-3 text-base text-text-secondary">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-required={!optional || undefined}
          aria-describedby={describedBy(id, error, help)}
          className={cn(control, 'h-12', error ? bad : ok, prefix && 'pl-[4.25rem]')}
          {...rest}
        />
      </div>
    </FieldShell>
  );
}

type AreaProps = Omit<FieldShell, 'children'> & ComponentProps<'textarea'>;

export function TextArea({ id, label, optional, help, error, className, ...rest }: AreaProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} help={help} error={error} className={className}>
      <textarea
        id={id}
        name={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, help)}
        className={cn(control, 'min-h-28 resize-y py-3 leading-relaxed', error ? bad : ok)}
        {...rest}
      />
    </FieldShell>
  );
}

type SelectProps = Omit<FieldShell, 'children'> &
  ComponentProps<'select'> & { options: { value: string; label: string }[]; placeholder?: string };

export function SelectField({ id, label, optional, help, error, className, options, placeholder, ...rest }: SelectProps) {
  return (
    <FieldShell id={id} label={label} optional={optional} help={help} error={error} className={className}>
      <div className="relative">
        <select
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-required={!optional || undefined}
          aria-describedby={describedBy(id, error, help)}
          className={cn(control, 'h-12 appearance-none pr-10', error ? bad : ok, !rest.value && 'text-text-muted')}
          {...rest}
        >
          {placeholder !== undefined ? <option value="">{placeholder}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value} className="text-navy-900">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-navy-400" aria-hidden />
      </div>
    </FieldShell>
  );
}
