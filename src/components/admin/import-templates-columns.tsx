"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ImportTemplate } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

export const getColumns = (
    onEdit: (template: ImportTemplate) => void,
    onDelete: (template: ImportTemplate) => void
): ColumnDef<ImportTemplate>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <DataTableColumnHeader column={column} title="Nome Template" />
      )
    },
  },
  {
    accessorKey: "fieldDefinitions",
    header: "Numero Campi",
    cell: ({ row }) => {
        const fields = row.getValue("fieldDefinitions") as any[];
        return <div className="text-center">{fields?.length || 0}</div>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const template = row.original

      return (
        <div className="text-right">
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Apri menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Azioni</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onEdit(template)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Modifica
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(template)} className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Elimina
                </DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )
    },
  },
] 