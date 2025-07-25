import React from 'react';

export default function Badge({ total, className }: { total: number, className?: string }) {
  return (
    <span className={`mt-1 ml-2 w-5 h-5 flex items-center justify-center text-xs rounded-full bg-blue-100 text-blue-600 ${className}`}>
      {total}
    </span>
  );
}