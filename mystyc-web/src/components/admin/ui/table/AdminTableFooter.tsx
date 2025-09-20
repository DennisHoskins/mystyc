'use client'

import { useBusy } from '@/components/ui/context/AppContext';

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
  const { setBusy } = useBusy();

  const handleClick = function() {
    if (!onRefresh) return;
    setBusy(true);
    onRefresh();
  }

  return (
    <div className="flex justify-between items-center pt-4">
      {onRefresh &&
        <div>
          <Button 
            className='!bg-purple-950 !text-gray-400 enabled:hover:!text-white enabled:hover:!bg-purple-700 disabled:!text-gray-500'
            variant="secondary" 
            size="xs" 
            onClick={handleClick}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      }
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
