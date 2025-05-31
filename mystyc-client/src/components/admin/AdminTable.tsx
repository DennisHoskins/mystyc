'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Text from '@/components/ui/Text';
import Button from '@/components/ui/Button';

interface AdminTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  title?: string;
  description?: string;
}

export default function AdminTable<T>({
  data,
  columns,
  loading,
  error = null,
  onRefresh,
  title,
  description,
}: AdminTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      {title && <div className="mb-2 font-semibold">{title}</div>}
      {description && <div className="mb-4 text-sm text-gray-500">{description}</div>}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-700">
          {error}
        </div>
      )}

      {onRefresh && (
        <div className="mb-2">
          <Button size="sm" onClick={onRefresh}>
            Refresh
          </Button>
        </div>
      )}

      <div className="rounded-md border min-h-[60vh] overflow-auto">
        <Table>
          <TableHeader className={!loading ? 'animate-fade-in' : 'opacity-0'}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={(header.column.columnDef.meta as any)?.className ?? ''}
                  >
                    {!header.isPlaceholder &&
                      flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody className={!loading ? 'animate-fade-in' : 'opacity-0'}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={(cell.column.columnDef.meta as any)?.className ?? ''}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && data.length > 0 && (
        <Text variant="small">
          Showing {data.length} result{data.length !== 1 ? 's' : ''}
        </Text>
      )}
    </div>
  );
}
