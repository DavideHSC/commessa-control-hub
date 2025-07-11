"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { RigaDaRiconciliare } from "@shared-types/index";
import { ArrowUpDown } from "lucide-react"
import { Button } from "../ui/button"

export const riconciliazioneColumns: ColumnDef<RigaDaRiconciliare>[] = [
  {
    accessorKey: "data",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Data
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
        const date = new Date(row.original.data)
        return <div>{date.toLocaleDateString()}</div>
    }
  },
  {
    accessorKey: "descrizione",
    header: "Descrizione",
    cell: ({ row }) => {
        return <div className="font-medium">{row.original.descrizione}</div>
    }
  },
  {
    accessorKey: "conto.nome",
    header: "Conto",
    cell: ({ row }) => {
        return <div>{row.original.conto.nome} ({row.original.conto.codice})</div>
    }
  },
  {
    accessorKey: "importo",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="text-right w-full"
          >
            Importo
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const amount = row.original.importo
      const formatted = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
      }).format(amount)
 
      return <div className="text-right font-medium">{formatted}</div>
    },
  },
  {
    accessorKey: "voceAnaliticaSuggerita.nome",
    header: "Voce Suggerita",
    cell: ({ row }) => {
        return <div>{row.original.voceAnaliticaSuggerita?.nome || <span className="text-muted-foreground">N/A</span>}</div>
    }
  },
] 