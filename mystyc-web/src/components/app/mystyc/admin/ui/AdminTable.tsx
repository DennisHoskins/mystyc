'use client';

import React from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
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
import { IconComponent } from '@/components/ui/icons/Icon';

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
  icon?: IconComponent | React.ReactNode;
  label?: string;
  data: T[];
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export default function AdminTable<T>({
  icon,
  label,
  data,
  columns,
  getRowId,
  loading = false,
  currentPage = 0,
  totalPages,
  totalItems,
  hasMore = false,
  onPageChange,
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
    return null;
  }

  if (data.length === 0) {
    return (
      <>
        {label && (
          <div className='flex justify-between items-center mb-2'>
            <div className='flex space-x-2 items-center'>
              {icon && <Avatar size={'small'} icon={icon} />}
              <Heading level={5}>{label}</Heading>
            </div>
            {totalItems && <Badge total={totalItems} />}
          </div>
        )}        
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
      {label && (
        <div className='flex justify-between items-center mb-2'>
          <div className='flex space-x-2 items-center'>
            {icon && <Avatar size={'small'} icon={icon} />}
            <Heading level={5}>{label}</Heading>
          </div>
          {totalItems && <Badge total={totalItems} />}
        </div>
      )}        
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