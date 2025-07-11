'use client';

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { VoceAnalitica } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { DataTableColumnHeader } from '../ui/data-table-column-header';
import { Badge } from '../ui/badge';

interface VociAnaliticheTableProps {
  data: VoceAnalitica[];
  onEdit: (voce: VoceAnalitica) => void;
  onDelete: (id: string) => void;
}

export const columns: ColumnDef<VoceAnalitica>[] = [
    {
      accessorKey: 'nome',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
    },
    {
      accessorKey: 'descrizione',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione" />,
      cell: ({ row }) => row.original.descrizione || '-',
    },
    {
      accessorKey: 'tipo',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
      cell: ({ row }) => {
        const tipo = row.original.tipo;
        return <Badge variant={tipo === 'Costo' ? 'destructive' : 'default'}>{tipo}</Badge>;
      }
    },
    {
      id: 'actions',
      cell: ({ row, table }) => {
        const { onEdit, onDelete } = table.options.meta as VociAnaliticheTableProps;
        return (
          <div className="text-right">
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
];
  
export const VociAnaliticheTable: React.FC<VociAnaliticheTableProps> = ({
  data,
  onEdit,
  onDelete,
}) => {
  return (
    <DataTable 
        columns={columns} 
        data={data} 
        meta={{ onEdit, onDelete }}
    />
  );
}; 