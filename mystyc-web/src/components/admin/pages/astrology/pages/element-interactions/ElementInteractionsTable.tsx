'use client'

import { useEffect, useCallback, useState } from 'react';

import { ElementInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getElementInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ElementInteractionsTableProps {
  elementInteractions?: ElementInteraction[];
  pagination?: Pagination;
  currentPage: number;
  loadElementInteractions: (currentPage: number) => void
}

export default function ElementInteractionsTable({ elementInteractions, pagination, currentPage, loadElementInteractions }: ElementInteractionsTableProps) {
  const columns: Column<ElementInteraction>[] = [
    { key: 'element1', header: 'Element 1', link: (e) => `/admin/astrology/elements/${e.element1}` },
    { key: 'element2', header: 'Element 2', link: (e) => `/admin/astrology/elements/${e.element2}` },
    { key: 'dynamic', header: 'Dynamic', link: (e) => `/admin/astrology/dynamics/${e.dynamic}` },
    { key: 'energyType', header: 'Energy Type', link: (e) => `/admin/astrology/energyTypes/${e.energyType}` },
    { key: 'keywords', header: 'Keywords', render: (e) => e.keywords.slice(0, 3).join(', ') + (e.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ElementInteraction>
      data={elementInteractions}
      columns={columns}
      loading={elementInteractions == null}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadElementInteractions}
      onRefresh={() => loadElementInteractions(currentPage)}
      emptyMessage="No Element Interactions found."
    />
  );
}