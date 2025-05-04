import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InboxIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DataTableProps<T> {
  columns: {
    accessorKey?: string;
    id?: string;
    header: string;
    cell?: ({ row }: { row: { original: T } }) => React.ReactNode;
  }[];
  data: T[];
  emptyMessage?: string;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No data found',
  isLoading = false,
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading data...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <InboxIcon className="h-12 w-12 text-muted-foreground opacity-50 mb-4" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id || column.accessorKey || column.header}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => {
                const key = column.id || column.accessorKey || column.header;
                return (
                  <TableCell key={key}>
                    {column.cell
                      ? column.cell({ row: { original: row } })
                      : column.accessorKey &&
                        (row as any)[column.accessorKey]?.toString()}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}