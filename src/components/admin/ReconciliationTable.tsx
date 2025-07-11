"use client"

import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { RigaDaRiconciliare } from "@/types";
import { riconciliazioneColumns } from "./riconciliazione-columns";

interface ReconciliationTableProps {
  data: RigaDaRiconciliare[];
  onRowClick: (row: RigaDaRiconciliare) => void;
  selectedRowId?: string;
}

export function ReconciliationTable({ data, onRowClick, selectedRowId }: ReconciliationTableProps) {
  return (
    <AdvancedDataTable
      columns={riconciliazioneColumns}
      data={data}
      onRowClick={onRowClick}
      selectedRowId={selectedRowId}
    />
  );
} 