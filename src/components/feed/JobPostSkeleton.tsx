import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export function JobPostSkeleton() {
  return (
    <div className="px-4 py-5 sm:px-5" aria-hidden>
      <div className="flex items-center gap-2">
        <Skeleton className="h-7 w-7" />
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-10" />
      </div>
      <div className="mt-3 sm:pl-9">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="mt-2.5 h-3 w-full" />
        <Skeleton className="mt-1.5 h-3 w-2/3" />
        <Skeleton className="mt-4 h-3 w-1/2" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="ml-auto h-8 w-36" />
        </div>
      </div>
    </div>);

}

export function FeedSkeleton({ count = 4 }: {count?: number;}) {
  return (
    <div className="divide-y divide-line border-y border-line">
      {Array.from({ length: count }).map((_, index) =>
      <JobPostSkeleton key={index} />
      )}
    </div>);

}