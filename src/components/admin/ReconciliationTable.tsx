import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { RigaDaRiconciliare } from "@/api/reconciliation";
import { getColumns } from "./riconciliazione-columns";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

interface ReconciliationTableProps {
  data: RigaDaRiconciliare[];
  onSaveSuccess: (rigaId: string) => void;
}

export const ReconciliationTable = ({ data, onSaveSuccess }: ReconciliationTableProps) => {

  const columns = useMemo(() => getColumns(onSaveSuccess), [onSaveSuccess]);

  return (
    <AdvancedDataTable
      columns={columns as ColumnDef<RigaDaRiconciliare, unknown>[]}
      data={data}
      totalCount={data.length}
      page={1}
      pageSize={data.length}
      search=""
      sorting={[]}
      loading={false}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      onSearchChange={() => {}}
      onSortingChange={() => {}}
    />
  );
}; 