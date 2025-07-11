"use client"

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { RigaDaRiconciliare } from "@shared-types/index";
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