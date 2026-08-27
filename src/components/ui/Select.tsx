import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  options: {value: string;label: string;}[];
  placeholder?: string;
}

export function Select({ invalid, options, placeholder, className, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        aria-invalid={invalid || undefined}
        className={cn(
          'h-10 w-full appearance-none border bg-surface px-3 pr-9 text-sm text-ink transition-colors duration-150 ease-out focus:border-ink focus:outline-none',
          invalid ? 'border-ink' : 'border-line-strong',
          className
        )}>
        
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
      <ChevronDownIcon
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden />
      
    </div>);

}