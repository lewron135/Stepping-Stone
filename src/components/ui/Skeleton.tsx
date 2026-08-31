import { cn } from '../../utils/cn';

export function Skeleton({ className }: {className?: string;}) {
  return <span aria-hidden className={cn('block animate-pulse bg-subtle', className)} />;
}