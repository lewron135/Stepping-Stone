import React from 'react';
import { AlertCircleIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  counter?: string;
  children: React.ReactNode;
  className?: string;
}

export function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  counter,
  children,
  className
}: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={htmlFor} className="text-[13px] font-semibold tracking-tight text-ink">
          {label}
          {required ? <span className="ml-1 text-muted">*</span> : null}
        </label>
        {counter ? <span className="text-[11px] tabular-nums text-faint">{counter}</span> : null}
      </div>
      {children}
      {error ?
      <p className="flex items-center gap-1.5 text-[12px] font-medium text-danger">
          <AlertCircleIcon className="h-3.5 w-3.5" aria-hidden />
          {error}
        </p> :
      hint ?
      <p className="text-[12px] leading-relaxed text-muted">{hint}</p> :
      null}
    </div>);

}