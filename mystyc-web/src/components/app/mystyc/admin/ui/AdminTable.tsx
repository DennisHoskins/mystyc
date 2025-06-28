'use client';

import React from 'react';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
}

interface AdminTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  currentPage?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  emptyMessage?: string;
}

export default function AdminTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  error = null,
  currentPage = 0,
  hasMore = false,
  onPageChange,
  onRetry,
  emptyMessage = 'No data found.',
}: AdminTableProps<T>) {
  
  const getItemKey = (item: T, index: number): string => {
    return getRowId ? getRowId(item) : index.toString();
  };

  const getCellValue = (item: T, column: Column<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item);
    }
    
    // Handle nested keys like "user.name"
    const keys = column.key.toString().split('.');
    let value: any = item;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    const displayValue = String(value || '-');
    
    if (displayValue.length > 50) {
      return displayValue.substring(0, 50) + '...';
    }
    
    return displayValue;
  };

  if (loading && currentPage === 0) {
    return (
      <Card>
        <Text>Loading...</Text>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
          <Text className="text-red-600">{error}</Text>
          {onRetry && (
            <Button onClick={onRetry} className="mt-4">
              Retry
            </Button>
          )}

      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <Text>{emptyMessage}</Text>
      </Card>
    );
  }

  return (
    <div className='rounded-lg shadow-sm bg-white '>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key.toString()} 
                  style={{ width: column.width }}
                  className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={getItemKey(item, index)}>
                {columns.map((column) => (
                  <TableCell 
                    key={`${getItemKey(item, index)}-${column.key.toString()}`}
                    className={column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : ''}
                  >
                    {getCellValue(item, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      
      {onPageChange && (
        <div className="flex justify-between items-center p-4 border-t border-t-gray-100">
          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
          >
            Previous
          </Button>
          
          <Text variant="small">
            Page {currentPage + 1}
          </Text>
          
          <Button
            variant="secondary"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasMore || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}