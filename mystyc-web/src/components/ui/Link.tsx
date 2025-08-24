'use client'

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

type LinkProps = {
  href?: string | null;
  children: ReactNode;
  className?: string;
  useTransition?: boolean;
  onClick?: (e: React.MouseEvent) => void;
};

export default function Link({ href, children, className, useTransition = true, onClick }: LinkProps) {
  const router = useTransitionRouter();
  const routerNext = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
      return;
    }
    if (!href) return;
    if (useTransition) {
      router.push(href);
    } else {
      routerNext.replace(href);
    }
  };

  return (
    href 
      ? <a
          href={href}
          onClick={handleClick}
          className={`text-indigo-300 hover:underline ${className || ''}`}
        >
          {children}
        </a>
      : children
  );
}
