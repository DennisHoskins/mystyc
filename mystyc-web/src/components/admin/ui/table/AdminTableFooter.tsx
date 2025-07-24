'use client';

interface AdminTableFooterProps {
  currentPage: number;
  totalPages?: number;
  hasMore?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
  onPageChange?: (page: number) => void;
}

import Button from '@/components/ui/Button';
import TablePagination from '@/components/ui/table/TablePagination';

export default function AdminTableFooter({ currentPage, totalPages, hasMore, loading, onRefresh, onPageChange } : AdminTableFooterProps){
  return (
    <div className="flex justify-between items-center pt-4">
      <div>
        {onRefresh && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={onRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
        )}
      </div>
      <div>
        {onPageChange && (
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasMore={hasMore}
            loading={loading}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
