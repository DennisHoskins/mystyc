'use client'

import React from 'react';

import { useTransitionRouter } from '@/hooks/useTransitionRouter';

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { IconComponent } from '@/components/ui/icons/Icon';

import AdminTableFooter from './AdminTableFooter';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  icon?: (item: T) => IconComponent | null;
  render?: (item: T) => React.ReactNode;
  link?: (item: T) => string | null;  
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
      className="hover:text-purple-200 underline-offset-2 hover:underline cursor-pointer"
    >
      {children}
    </a>
  );
}

interface AdminTableProps<T> {
  data?: T[] | null;
  columns: Column<T>[];
  getRowId?: (row: T) => string;
  loading?: boolean;
  currentPage?: number;
  totalPages?: number;
  hasMore?: boolean;
  onPageChange?: (page: number) => void;
  onRefresh?: () => void;
  emptyMessage?: string;
}

export default function AdminTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  currentPage = 0,
  totalPages,
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
      column.icon ?
      renderIcon(item, column) :
      getDisplayValue(item, column);

    // If column has a link function, wrap content in LinkCell
    if (column.link) {
      const href = column.link(item);
      return href ? <LinkCell href={href}>{content}</LinkCell> : content;
    }

    return content;
  };

  const renderIcon = (item: T, column: Column<T>): React.ReactNode | null => {
    if (!column.icon) {
      return null;
    }
    const IconComponent = column.icon(item);
    if (!IconComponent) {
      return null;
    }

    const href = column.link && column.link(item);

    return (
      <span className={`w-full flex justify-center ${href ? "" : "text-gray-300"}`}>
        {React.createElement(IconComponent, { size: 18 })}
      </span>
    );
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

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            {loading == false && columns.map((column) => (
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
          {loading == false && data && data.length > 0 && data.map((item, index) => (
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
          
          {loading == false && (!data || data.length == 0) && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {(onRefresh || onPageChange) && 
        <AdminTableFooter 
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          loading={loading}
          onRefresh={onRefresh}
          onPageChange={onPageChange}
        />
      }
    </>
  );
}