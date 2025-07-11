"use client";

import { RigaDaRiconciliare } from "@/api/reconciliation";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { AllocationCell } from "./AllocationCell";

export const getColumns = (onSaveSuccess: (rigaId: string) => void): ColumnDef<RigaDaRiconciliare>[] => [
  {
    accessorKey: "conto",
    header: "Conto",
  },
  {
    accessorKey: "note",
    header: "Descrizione",
  },
  {
    accessorKey: "importoDare",
    header: "Dare",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("importoDare"))
        const formatted = new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: "EUR",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
    }
  },
  {
    accessorKey: "importoAvere",
    header: "Avere",
    cell: ({ row }) => {
        const amount = parseFloat(row.getValue("importoAvere"))
        const formatted = new Intl.NumberFormat("it-IT", {
            style: "currency",
            currency: "EUR",
        }).format(amount)
        return <div className="text-right font-medium">{formatted}</div>
    }
  },
  {
    id: "suggerimento",
    header: "Suggerimento Voce",
    cell: ({ row }) => {
      const { suggerimentoVoceAnaliticaId } = row.original;
      return suggerimentoVoceAnaliticaId ? (
        <Badge variant="outline">ID: {suggerimentoVoceAnaliticaId}</Badge>
      ) : (
        <Badge variant="secondary">N/A</Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Azione",
    cell: ({ row }) => {
        return <AllocationCell row={row} onSaveSuccess={onSaveSuccess} />
    }
  }
]; 