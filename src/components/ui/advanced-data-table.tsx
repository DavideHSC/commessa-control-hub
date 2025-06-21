import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
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

interface AdvancedDataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  
  searchValue: string;
  onSearchChange: (search: string) => void;
  
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  
  loading?: boolean;
  emptyMessage?: string;
  
  // onAdd?: () => void;
  // onEdit?: (item: TData) => void;
  // onDelete?: (item: TData) => void;
}

export function AdvancedDataTable<TData>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearchChange,
  sorting,
  onSortingChange,
  loading = false,
  emptyMessage = "No results found.",
}: AdvancedDataTableProps<TData>) {

  const pageCount = Math.ceil(totalCount / pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Server-side pagination
    manualPagination: true,
    pageCount,
    // Server-side sorting
    manualSorting: true,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
      sorting,
    },
    onPaginationChange: (updater) => {
        if (typeof updater === 'function') {
            const newPagination = updater({ pageIndex: page - 1, pageSize });
            onPageChange(newPagination.pageIndex + 1);
            onPageSizeChange(newPagination.pageSize);
        }
    },
    onSortingChange: (updater) => {
        if (typeof updater === 'function') {
            onSortingChange(updater(sorting));
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
        searchValue={searchValue}
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
                  data-state={row.getIsSelected() && "selected"}
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
      <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  )
}