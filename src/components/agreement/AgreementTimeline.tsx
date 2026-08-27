import React from 'react';
import { CheckIcon, LockIcon, XIcon } from 'lucide-react';
import type { AgreementStatus } from '../../types';
import { AGREEMENT_STEPS, STATUS_LABEL, stepIndex } from '../../utils/status';
import { cn } from '../../utils/cn';

export function AgreementTimeline({ status }: {status: AgreementStatus;}) {
  const current = stepIndex(status);

  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 border border-line bg-subtle px-3 py-2.5 text-[13px] text-muted">
        <XIcon className="h-4 w-4" aria-hidden />
        Kesepakatan dibatalkan. Jejaknya tercatat di track record kedua pihak.
      </div>);

  }

  return (
    <ol className="flex items-stretch">
      {AGREEMENT_STEPS.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.status} className="flex min-w-0 flex-1 flex-col gap-2">
            <span
              className={cn(
                'h-0.5 w-full',
                done || active ? 'bg-ink' : 'bg-line'
              )} />
            
            <span className="flex items-center gap-1.5 pr-2">
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center border text-[9px] font-bold',
                  done && 'border-transparent bg-inverse-bg text-inverse-ink',
                  active && 'border-ink text-ink',
                  !done && !active && 'border-line text-faint'
                )}>
                
                {done ?
                <CheckIcon className="h-2.5 w-2.5" aria-hidden /> :
                step.status === 'locked' && active ?
                <LockIcon className="h-2.5 w-2.5" aria-hidden /> :

                index + 1
                }
              </span>
              <span
                className={cn(
                  'truncate text-[11px] font-semibold tracking-tight',
                  done || active ? 'text-ink' : 'text-faint'
                )}>
                
                {step.label}
              </span>
            </span>
          </li>);

      })}
      <span className="sr-only">Status saat ini: {STATUS_LABEL[status]}</span>
    </ol>);

}