import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface TabsProps<T extends string> {
  items: {value: T;label: string;count?: number;}[];
  value: T;
  onChange: (value: T) => void;
  layoutId?: string;
  className?: string;
  size?: 'md' | 'lg';
}

export function Tabs<T extends string>({
  items,
  value,
  onChange,
  layoutId = 'tab-indicator',
  className,
  size = 'md'
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn('flex items-stretch gap-1 border-b border-line', className)}>
      
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative -mb-px flex items-center gap-2 px-3 pb-3 pt-2 font-semibold tracking-tight transition-colors duration-150 ease-out',
              size === 'lg' ? 'text-[15px]' : 'text-sm',
              active ? 'text-ink' : 'text-muted hover:text-ink'
            )}>
            
            {item.label}
            {typeof item.count === 'number' ?
            <span className="text-[11px] font-medium tabular-nums text-faint">{item.count}</span> :
            null}
            {active ?
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-0 -bottom-px h-0.5 bg-ink"
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }} /> :

            null}
          </button>);

      })}
    </div>);

}