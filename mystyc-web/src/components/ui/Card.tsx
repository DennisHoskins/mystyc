import React from 'react';

export default function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-md overflow-hidden p-4 shadow-sm bg-white flex flex-col ${className}`}>
      {children}
    </div>
  );
}