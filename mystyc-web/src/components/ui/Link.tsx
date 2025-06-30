'use client';

import { ReactNode } from 'react';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function Link({ href, children, className }: LinkProps) {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={`text-indigo-600 hover:underline ${className || ''}`}
    >
      {children}
    </a>
  );
}
