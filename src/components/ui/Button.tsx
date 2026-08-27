import React from 'react';
import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'tertiary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

const VARIANTS: Record<Variant, string> = {
  primary:
  'bg-inverse-bg text-inverse-ink border border-transparent hover:opacity-90 active:opacity-80',
  secondary: 'bg-transparent text-ink border border-line-strong hover:bg-subtle',
  tertiary: 'bg-transparent text-muted border border-transparent hover:text-ink hover:bg-subtle'
};

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2'
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap rounded-none font-medium transition-[opacity,background-color,color,transform] duration-150 ease-out',
        'disabled:pointer-events-none disabled:opacity-40',
        'active:scale-[0.99]',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className
      )}>
      
      {loading ?
      <span
        className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
        aria-hidden /> :


      icon
      }
      {children}
    </button>);

}