import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, InfoIcon, XIcon } from 'lucide-react';

interface Toast {
  id: number;
  title: string;
  description?: string;
  tone: 'default' | 'lock';
}

interface ToastValue {
  toast: (title: string, description?: string, tone?: Toast['tone']) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: {children: React.ReactNode;}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, description?: string, tone: Toast['tone'] = 'default') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, tone }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-4 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0"
        role="status"
        aria-live="polite">
        
        <AnimatePresence initial={false}>
          {toasts.map((item) =>
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
            className="pointer-events-auto flex items-start gap-3 border border-line bg-inverse-bg px-4 py-3 text-inverse-ink shadow-pop">
            
              <span className="mt-0.5 shrink-0">
                {item.tone === 'lock' ?
              <CheckIcon className="h-4 w-4" aria-hidden /> :

              <InfoIcon className="h-4 w-4" aria-hidden />
              }
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-snug">{item.title}</p>
                {item.description ?
              <p className="mt-0.5 text-xs leading-relaxed opacity-70">{item.description}</p> :
              null}
              </div>
              <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Tutup notifikasi"
              className="shrink-0 opacity-60 transition-opacity duration-150 ease-out hover:opacity-100">
              
                <XIcon className="h-4 w-4" aria-hidden />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>);

}

export function useToast(): ToastValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}