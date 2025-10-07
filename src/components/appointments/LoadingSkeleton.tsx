import React from 'react';

const LoadingSkeleton: React.FC = () => (
  <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 8 }).map((_, i) => (
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

export default LoadingSkeleton;
