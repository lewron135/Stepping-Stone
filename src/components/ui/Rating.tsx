import React from 'react';
import { StarIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = { sm: 'h-3.5 w-3.5', md: 'h-4 w-4', lg: 'h-7 w-7' };

export function Rating({ value, onChange, size = 'md', className }: RatingProps) {
  const stars = [1, 2, 3, 4, 5];

  if (!onChange) {
    return (
      <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value} dari 5`}>
        {stars.map((star) =>
        <StarIcon
          key={star}
          aria-hidden
          className={cn(SIZES[size], star <= value ? 'fill-ink text-ink' : 'text-line-strong')} />

        )}
      </span>);

  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)} role="radiogroup" aria-label="Beri rating">
      {stars.map((star) =>
      <button
        key={star}
        type="button"
        role="radio"
        aria-checked={value === star}
        aria-label={`${star} bintang`}
        onClick={() => onChange(star)}
        className="p-0.5 transition-transform duration-150 ease-out hover:scale-110">
        
          <StarIcon
          aria-hidden
          className={cn(SIZES[size], star <= value ? 'fill-ink text-ink' : 'text-line-strong')} />
        
        </button>
      )}
    </div>);

}