import * as React from "react"
export type { ColumnDef, SortingState } from "@tanstack/react-table"
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnDef
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"
import { Skeleton } from "./skeleton";

interface AdvancedDataTableProps<TData extends { id: string }> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  
  // Server-side props (optional)
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  
  search?: string;
  onSearchChange?: (search: string) => void;
  
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  
  loading?: boolean;
  emptyMessage?: string;

  // Interactivity props
  onRowClick?: (row: TData) => void;
  selectedRowId?: string;
}

export function AdvancedDataTable<TData extends { id: string }>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  sorting,
  onSortingChange,
  loading = false,
  emptyMessage = "No results found.",
  onRowClick,
  selectedRowId,
}: AdvancedDataTableProps<TData>) {

  const isServerSide = totalCount !== undefined && page !== undefined && pageSize !== undefined;
  const pageCount = isServerSide ? Math.ceil(totalCount / pageSize) : undefined;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Pagination
    manualPagination: isServerSide,
    pageCount,
    // Sorting
    manualSorting: isServerSide,
    // State
    state: {
      pagination: {
        pageIndex: isServerSide ? page - 1 : 0,
        pageSize: isServerSide ? pageSize : data.length,
      },
      sorting: sorting || [],
    },
    onPaginationChange: (updater) => {
        if (!onPageChange || !onPageSizeChange) return;
        if (typeof updater === 'function') {
            const newPagination = updater({ pageIndex: page! - 1, pageSize: pageSize! });
            onPageChange(newPagination.pageIndex + 1);
            onPageSizeChange(newPagination.pageSize);
        }
    },
    onSortingChange: (updater) => {
        if (!onSortingChange) return;
        if (typeof updater === 'function') {
            onSortingChange(updater(sorting || []));
        } else {
            onSortingChange(updater);
        }
    }
  })

  const skeletonRows = Array(pageSize).fill(0);
  const skeletonCols = columns.length;

  return (
    <div className="space-y-4">
      <DataTableToolbar 
        table={table}
        searchValue={search}
        onSearchChange={onSearchChange}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
                skeletonRows.map((_, rowIndex) => (
                    <TableRow key={`skeleton-row-${rowIndex}`}>
                        {Array(skeletonCols).fill(0).map((_, colIndex) => (
                            <TableCell key={`skeleton-cell-${rowIndex}-${colIndex}`}>
                                <Skeleton className="h-6 w-full" />
                            </TableCell>
                        ))}
                    </TableRow>
                ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={selectedRowId === row.original.id && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="h-2" />
      {isServerSide && <DataTablePagination table={table} totalCount={totalCount} />}
    </div>
  )
}