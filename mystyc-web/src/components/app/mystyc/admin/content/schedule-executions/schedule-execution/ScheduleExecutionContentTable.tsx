'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin, PaginatedResponse } from '@/api/apiClientAdmin';
import { formatDateForDisplay } from '@/util/dateTime';
import { Content } from '@/interfaces';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import ContentIcon from '../../../ui/icons/ContentIcon';

export default function ScheduleExecutionsContentTable({ executionId }: { executionId: string | null | undefined}) {
  const [content, setContent] = useState<PaginatedResponse<Content> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadScheduleExecutionContent = useCallback(async (page: number) => {
    if (!executionId) {
      return;
    }
    try {
      setLoading(true);

      const response = await apiClientAdmin.getScheduleExecutionContent(
        executionId, 
        {
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'clientTimestamp',
          sortOrder: 'desc',
        }        
      );
      setContent(response);

      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load schedule execution content:', err);
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    if (!executionId) {
      return;
    }

    loadScheduleExecutionContent(0);
  }, [executionId, loadScheduleExecutionContent]);

  if (!content?.data) {
    return null;
  }

  const columns: Column<Content>[] = [
    { key: 'date', header: 'Date', link: (u) => `/admin/content/${u._id}`, render: (u) => formatDateForDisplay(u.date) || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}` },
    { key: 'message', header: 'Message', link: (u) => `/admin/content/${u._id}` },
  ];

  return (
    <Card className='h-[56rem]'>
      <AdminTable<Content>
        icon={<ContentIcon />}
        label={"Content"}
        data={content.data}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadScheduleExecutionContent}
        onRefresh={() => loadScheduleExecutionContent(currentPage)}
        emptyMessage="No Content found."
      />
    </Card>      
  );
}