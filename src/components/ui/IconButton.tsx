import React from 'react';
import { cn } from '../../utils/cn';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  variant?: 'ghost' | 'outline' | 'solid';
}

export function IconButton({
  label,
  variant = 'ghost',
  className,
  children,
  ...rest
}: IconButtonProps) {
  return (
    <button
      {...rest}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center transition-colors duration-150 ease-out',
        variant === 'ghost' && 'text-muted hover:bg-subtle hover:text-ink',
        variant === 'outline' && 'border border-line-strong text-ink hover:bg-subtle',
        variant === 'solid' && 'bg-inverse-bg text-inverse-ink hover:opacity-90',
        className
      )}>
      
      {children}
    </button>);

}