'use client'

import React from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

interface TableCellLinkProps {
  value: string;
  prefix: string;
  children?: React.ReactNode;
}

export default function TableCellLink({
  value,
  prefix,
  children,
}: TableCellLinkProps) {
  const router = useTransitionRouter();
  return (
    <button
      type="button"
      onClick={() => router.push(`${prefix}/${encodeURIComponent(value)}`)}
      className="text-blue-600 hover:underline"
    >
      {children ?? value}
    </button>
  );
}
