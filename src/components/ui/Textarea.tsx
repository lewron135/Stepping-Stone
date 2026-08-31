import React from 'react';
import { cn } from '../../utils/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({ invalid, className, rows = 4, ...rest }: TextareaProps) {
  return (
    <textarea
      {...rest}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        'w-full resize-y border bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-faint transition-colors duration-150 ease-out focus:border-ink focus:outline-none',
        invalid ? 'border-danger' : 'border-line-strong',
        className
      )} />);


}