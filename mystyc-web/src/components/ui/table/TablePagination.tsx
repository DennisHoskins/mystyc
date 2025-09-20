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

  const className = '!bg-purple-950 !text-gray-400 enabled:hover:!text-white enabled:hover:!bg-purple-700 disabled:!text-gray-500';

  return (
    <div className="flex items-center gap-2">
      <Button
        className={className}
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
        className={className}
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