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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  expanded?: ExpandedState
  onExpandedChange?: React.Dispatch<React.SetStateAction<ExpandedState>>
  getRowCanExpand?: (row: any) => boolean
  renderRowSubComponent?: (props: any) => React.ReactElement
}

export function AdvancedDataTable<TData, TValue>({
  columns,
  data,
  expanded,
  onExpandedChange,
  getRowCanExpand,
  renderRowSubComponent,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([])

    const table = useReactTable({
        data,
        columns,
        getRowCanExpand,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onExpandedChange: onExpandedChange,
        getExpandedRowModel: getExpandedRowModel(),
        state: {
            sorting,
            expanded,
        },
    })

  return (
    <div>
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
            {table.getRowModel().rows?.length ? (
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
                          {renderRowSubComponent({ row })}
                      </TableRow>
                  )}
                </React.Fragment>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    Nessun risultato.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            >
            Precedente
            </Button>
            <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            >
            Successivo
            </Button>
        </div>
    </div>
  )
} 