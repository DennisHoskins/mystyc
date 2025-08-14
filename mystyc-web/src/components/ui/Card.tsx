import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-md p-4 shadow-lg border border-gray-100 bg-white flex flex-col space-y-1 ${className}`}>
      {children}
    </div>
  );
}