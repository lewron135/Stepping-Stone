import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  prefix?: string;
}

export function Input({ invalid, prefix, className, ...rest }: InputProps) {
  return (
    <div
      className={cn(
        'flex items-center border bg-surface transition-colors duration-150 ease-out focus-within:border-ink',
        invalid ? 'border-danger' : 'border-line-strong'
      )}>
      
      {prefix ?
      <span className="border-r border-line px-3 py-2.5 text-sm text-muted">{prefix}</span> :
      null}
      <input
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full bg-transparent px-3 text-sm text-ink placeholder:text-faint focus:outline-none',
          className
        )} />
      
    </div>);

}