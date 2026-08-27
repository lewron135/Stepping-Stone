import React from 'react';
import { cn } from '../../utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 shrink-0 border transition-colors duration-150 ease-out',
        checked ? 'border-transparent bg-inverse-bg' : 'border-line-strong bg-subtle'
      )}>
      
      <span
        className={cn(
          'absolute top-0.5 h-4 w-4 transition-transform duration-150 ease-out',
          checked ? 'translate-x-6 bg-inverse-ink' : 'translate-x-1 bg-muted'
        )} />
      
    </button>);

}