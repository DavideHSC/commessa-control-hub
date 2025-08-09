'use client';

import { ColumnDef } from '@tanstack/react-table';
import { RegolaRipartizione } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

type ColumnsProps = {
  onEdit: (rule: RegolaRipartizione) => void;
  onDelete: (id: string) => void;
};

export const columns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<RegolaRipartizione>[] => {
  type ActionsCellProps = {
    row: {
      original: RegolaRipartizione;
    };
  };

  const ActionsCell: React.FC<ActionsCellProps> = ({ row }) => {
    const rule = row.original;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Apri menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(rule)}>Modifica</DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(rule.id)}>Elimina</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  return [
    {
      accessorKey: 'descrizione',
      header: 'Descrizione',
    },
    {
      accessorKey: 'conto.nome',
      header: 'Conto',
    },
    {
      accessorKey: 'commessa.nome',
      header: 'Commessa',
    },
    {
      accessorKey: 'voceAnalitica.nome',
      header: 'Voce Analitica',
    },
    {
      accessorKey: 'percentuale',
      header: 'Percentuale',
      cell: ({ row }) => `${row.original.percentuale}%`,
    },
    {
      id: 'actions',
      cell: ({ row }) => <ActionsCell row={row} />,
    },
  ];
}; 