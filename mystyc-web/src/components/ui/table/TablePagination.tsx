'use client';

import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

interface TablePaginationProps {
  currentPage: number;
  totalPages?: number;
  hasMore?: boolean;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export default function TablePagination({
  currentPage,
  totalPages,
  hasMore,
  loading = false,
  onPageChange,
}: TablePaginationProps) {
  const displayText = totalPages 
    ? `Page ${currentPage + 1} of ${totalPages}`
    : `Page ${currentPage + 1}`;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
      >
        Previous
      </Button>
      
      <Text variant="small" className="px-2">
        {displayText}
      </Text>
      
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={(!hasMore && !totalPages) || (totalPages && currentPage >= totalPages - 1) || loading}
      >
        Next
      </Button>
    </div>
  );
}