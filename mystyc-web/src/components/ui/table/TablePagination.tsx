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
  const displayText = loading 
    ? "" 
    : totalPages 
      ? `Page ${currentPage + 1} of ${totalPages}`
      : `Page ${currentPage + 1}`;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="xs"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0 || loading}
      >
        Previous
      </Button>
      
      <Text variant="small" className="text-center !text-[10px]">
        {displayText}
      </Text>
      
      <Button
        variant="secondary"
        size="xs"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={(!hasMore && !totalPages) || (totalPages && currentPage >= totalPages - 1) || loading}
      >
        Next
      </Button>
    </div>
  );
}