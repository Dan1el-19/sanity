import React from 'react';

/**
 * Generic loading skeleton used across tools for quick placeholder UIs.
 * Supports a compact grid and a list variant used on pages with headers.
 */
export type LoadingSkeletonProps = {
  variant?: 'grid' | 'list';
  itemCount?: number;
};

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'grid',
  itemCount = 6 
}) => {
  if (variant === 'grid') {
    return (
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: itemCount }).map((_, i) => (
          <div key={i} className="card bg-base-200 shadow-sm animate-pulse border border-base-300">
            <div className="card-body space-y-4">
              <div className="h-5 w-1/2 bg-base-300 rounded" />
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-base-300 rounded" />
                <div className="h-3 w-2/3 bg-base-300 rounded" />
                <div className="h-3 w-1/2 bg-base-300 rounded" />
              </div>
              <div className="h-10 w-full bg-base-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Variant 'list' - for schedules/blockedSlots with header
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex-1">
          <div className="h-9 bg-base-300 rounded-lg w-64 mb-2 animate-pulse"></div>
          <div className="h-5 bg-base-300 rounded w-96 animate-pulse"></div>
        </div>
        <div className="h-12 bg-base-300 rounded-lg w-48 animate-pulse"></div>
      </div>

      {/* List Skeleton */}
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 2xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card bg-base-100 shadow-md border border-base-300">
            <div className="card-body">
              <div className="flex items-start justify-between mb-3 gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-6 bg-base-300 rounded w-48 animate-pulse"></div>
                  </div>
                  <div className="h-4 bg-base-300 rounded w-32 animate-pulse"></div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="h-4 bg-base-300 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-base-300 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-base-300 rounded w-1/2 animate-pulse"></div>
              </div>

              <div className="flex gap-2">
                <div className="h-9 bg-base-300 rounded w-24 animate-pulse"></div>
                <div className="h-9 bg-base-300 rounded w-24 animate-pulse"></div>
                <div className="h-9 bg-base-300 rounded flex-1 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
