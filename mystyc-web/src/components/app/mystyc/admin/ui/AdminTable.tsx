'use client';

import React from 'react';
import { useTransitionRouter } from '@/hooks/useTransitionRouter';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';
import TablePagination from '@/components/ui/table/TablePagination';
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
  link?: (item: T) => string;  
}

interface LinkCellProps {
  href: string;
  children: React.ReactNode;
}

function LinkCell({ href, children }: LinkCellProps) {
  const router = useTransitionRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
      return;
    }
    
    e.preventDefault();
    router.push(href);
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
}

interface AdminTableProps<T> {
  label?: string;
  data: T[];
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  currentPage?: number;
  totalPages?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  onRetry?: () => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export default function AdminTable<T>({
  label,
  data,
  columns,
  getRowId,
  loading = false,
  error = null,
  currentPage = 0,
  totalPages,
  hasMore = false,
  onPageChange,
  onRetry,
  onRefresh,
  emptyMessage = 'No data found.',
}: AdminTableProps<T>) {
  
  const getItemKey = (item: T, index: number): string => {
    return getRowId ? getRowId(item) : index.toString();
  };

  const getCellValue = (item: T, column: Column<T>): React.ReactNode => {
    const content = column.render ? 
      column.render(item) : 
      getDisplayValue(item, column);

    // If column has a link function, wrap content in LinkCell
    if (column.link) {
      const href = column.link(item);
      return href ? <LinkCell href={href}>{content}</LinkCell> : content;
    }

    return content;
  };

  const getDisplayValue = (item: T, column: Column<T>): string => {
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
      <>
        {label && <Heading level={3} className="mb-4">{label}</Heading>}
        <Text className='mt-4'>Loading...</Text>
      </>
    );
  }

  if (error) {
    return (
      <>
        {label && <Heading level={3} className="mb-4">{label}</Heading>}
        <Text className="text-red-600">{error}</Text>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4">
            Retry
          </Button>
        )}
      </>
    );
  }

  if (data.length === 0) {
    return (
      <>
        {label && <Heading level={4} className="mb-4">{label}</Heading>}
        <Text className='mt-4'>{emptyMessage}</Text>
        {(onRefresh || onPageChange) && (
          <div className="flex justify-between items-center pt-4 border-t border-gray-100 mt-4">
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
        )}
      </>
    );
  }

  return (
    <>
      {label && <Heading level={5} className="mb-4">{label}</Heading>}
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
      
      {(onRefresh || onPageChange) && (
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
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
      )}
    </>
  );
}