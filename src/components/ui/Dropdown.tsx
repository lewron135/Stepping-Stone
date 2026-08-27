import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface DropdownItem {
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  label: string;
}

export function Dropdown({ trigger, items, align = 'right', label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center transition-opacity duration-150 ease-out hover:opacity-80">
        
        {trigger}
      </button>
      <AnimatePresence>
        {open ?
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            'absolute top-full z-50 mt-2 min-w-48 border border-line bg-surface py-1 shadow-pop',
            align === 'right' ? 'right-0' : 'left-0'
          )}>
          
            {items.map((item) =>
          <button
            key={item.label}
            role="menuitem"
            type="button"
            onClick={() => {
              setOpen(false);
              item.onSelect();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-ink transition-colors duration-150 ease-out hover:bg-subtle">
            
                {item.icon}
                {item.label}
              </button>
          )}
          </motion.div> :
        null}
      </AnimatePresence>
    </div>);

}