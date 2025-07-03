'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

type LinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  useTransition?: boolean;
};

export default function Link({ href, children, className, useTransition = true }: LinkProps) {
  const router = useTransitionRouter();
  const routerNext = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (useTransition) {
      router.push(href);
    } else {
      routerNext.replace(href);
    }
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
