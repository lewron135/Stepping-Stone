import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, description, children, footer }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ?
      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          <motion.button
          type="button"
          aria-label="Tutup"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-[1px]" />
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto border border-line bg-surface shadow-pop">
          
            <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
              <div>
                <h2 className="text-base font-bold tracking-tight text-ink">{title}</h2>
                {description ?
              <p className="mt-1 text-[13px] leading-relaxed text-muted">{description}</p> :
              null}
              </div>
              <button
              type="button"
              onClick={onClose}
              aria-label="Tutup dialog"
              className="-mr-1 -mt-1 p-1 text-muted transition-colors duration-150 ease-out hover:text-ink">
              
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
            {footer ?
          <div className="flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div> :
          null}
          </motion.div>
        </div> :
      null}
    </AnimatePresence>);

}