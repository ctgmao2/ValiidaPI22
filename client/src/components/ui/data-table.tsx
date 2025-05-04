import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DataTableProps<TData> {
  columns: {
    accessorKey?: string;
    id?: string;
    header: string;
    cell?: ({ row }: { row: { original: TData } }) => React.ReactNode;
  }[];
  data: TData[];
  emptyMessage?: string;
  pageSize?: number;
  paginationOptions?: number[];
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No data available",
  pageSize: initialPageSize = 10,
  paginationOptions = [5, 10, 20, 50, 100],
}: DataTableProps<TData>) {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Reset page index when data changes
  useEffect(() => {
    setPageIndex(0);
  }, [data]);

  // Calculate pagination
  const pageCount = Math.ceil(data.length / pageSize);
  const pageStart = pageIndex * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, data.length);
  const currentPageData = data.slice(pageStart, pageEnd);

  return (
    <div className="space-y-4">
      <div className="rounded-md overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) => (
                <TableHead key={column.id || column.accessorKey || i}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentPageData.length > 0 ? (
              currentPageData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, columnIndex) => (
                    <TableCell key={column.id || column.accessorKey || columnIndex}>
                      {column.cell
                        ? column.cell({ row: { original: row } })
                        : column.accessorKey
                        ? (row as any)[column.accessorKey]
                        : null}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.length > 0 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Showing {pageStart + 1} to {pageEnd} of {data.length} entries
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={pageSize.toString()}
                onValueChange={(val) => setPageSize(Number(val))}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {paginationOptions.map((opt) => (
                    <SelectItem key={opt} value={opt.toString()}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageIndex - 1)}
                disabled={pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                <Input
                  className="h-8 w-[50px] text-center"
                  value={pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                    setPageIndex(page < 0 ? 0 : page >= pageCount ? pageCount - 1 : page);
                  }}
                />
                <span className="text-sm text-muted-foreground">of {pageCount}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={pageIndex === pageCount - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex === pageCount - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}