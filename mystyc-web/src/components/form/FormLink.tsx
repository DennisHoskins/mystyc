'use client';

import { ReactNode } from 'react';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';

type FormLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export default function FormLink({ href, children, className }: FormLinkProps) {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className={className || 'text-indigo-600 hover:underline'}
    >
      {children}
    </a>
  );
}
