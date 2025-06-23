"use client"

import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getExpandedRowModel,
  SortingState,
  ExpandedState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTablePagination } from './data-table-pagination';
import { Input } from './input';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  searchValue: string
  onSearchChange: (value: string) => void
  sorting: SortingState
  onSortingChange: (sorting: SortingState) => void
  loading: boolean
  emptyMessage?: string
  expanded?: ExpandedState
  onExpandedChange?: React.Dispatch<React.SetStateAction<ExpandedState>>
  getRowCanExpand?: (row: any) => boolean
  renderRowSubComponent?: (props: any) => React.ReactElement
}

export function AdvancedDataTable<TData, TValue>({
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
  loading,
  emptyMessage,
  expanded,
  onExpandedChange,
  getRowCanExpand,
  renderRowSubComponent,
}: DataTableProps<TData, TValue>) {

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        rowCount: totalCount,
        getRowCanExpand,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: onSortingChange,
        getSortedRowModel: getSortedRowModel(),
        onExpandedChange: onExpandedChange,
        getExpandedRowModel: getExpandedRowModel(),
        state: {
            sorting,
            expanded,
            pagination: {
                pageIndex: page,
                pageSize,
            }
        },
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newPagination = updater({ pageIndex: page, pageSize });
                onPageChange(newPagination.pageIndex);
                onPageSizeChange(newPagination.pageSize);
            }
        }
    })

  return (
    <div className='space-y-4'>
        <div className="flex items-center justify-between">
            <Input
                placeholder="Filtra..."
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                className="max-w-sm"
            />
        </div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
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
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        Caricamento in corso...
                    </TableCell>
                </TableRow>
            ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                      ))}
                  </TableRow>
                  {row.getIsExpanded() && renderRowSubComponent && (
                      <TableRow>
                          <TableCell colSpan={columns.length}>
                            {renderRowSubComponent({ row })}
                          </TableCell>
                      </TableRow>
                  )}
                </React.Fragment>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyMessage || "Nessun risultato."}
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <DataTablePagination table={table} totalCount={totalCount} />
    </div>
  )
} 