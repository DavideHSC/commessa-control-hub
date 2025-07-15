import { Cross2Icon } from "@radix-ui/react-icons"
import { Table } from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { useDebounce } from "use-debounce"

import { Button } from "./button"
import { Input } from "./input"
import { DataTableViewOptions } from "./data-table-view-options"
import React from "react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchValue?: string
  onSearchChange?: (value: string) => void
  toolbarButtons?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchValue = '',
  onSearchChange,
  toolbarButtons
}: DataTableToolbarProps<TData>) {

  const [localSearch, setLocalSearch] = useState(searchValue);
  const [debouncedSearch] = useDebounce(localSearch, 300);

  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange]);

  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const handleReset = () => {
    if (onSearchChange) {
      onSearchChange("");
    }
    table.resetColumnFilters();
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Cerca in tutte le colonne..."
          value={localSearch}
          onChange={(event) => setLocalSearch(event.target.value)}
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {toolbarButtons}
        {localSearch && (
          <Button
            variant="ghost"
            onClick={handleReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  )
} 