import React from 'react';

export default function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-4 bg-[#2e0847] border border-purple-950 rounded-sm flex flex-col space-y-1 ${className}`}>
      {children}
    </div>
  );
}