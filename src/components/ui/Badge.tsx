import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  tone?: 'solid' | 'outline' | 'muted' | 'dashed';
  icon?: React.ReactNode;
  className?: string;
  uppercase?: boolean;
}

export function Badge({ children, tone = 'outline', icon, className, uppercase }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-semibold leading-5',
        uppercase && 'uppercase tracking-wide',
        tone === 'solid' && 'bg-inverse-bg text-inverse-ink',
        tone === 'outline' && 'border border-line-strong text-ink',
        tone === 'muted' && 'bg-subtle text-muted',
        tone === 'dashed' && 'border border-dashed border-line-strong text-muted',
        className
      )}>
      
      {icon}
      {children}
    </span>);

}