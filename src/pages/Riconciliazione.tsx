import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RigaScrittura } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable, ColumnDef } from '@/components/ui/advanced-data-table';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

// Placeholder per il form di allocazione
const AllocationForm = ({ riga, onAllocationSuccess }: { riga: RigaScrittura, onAllocationSuccess: () => void }) => {
  // In futuro qui ci sarà il form con Zod, react-hook-form etc.
  return (
    <div>
      <h3 className="text-lg font-medium">Alloca riga: {riga.descrizione}</h3>
      <p className="mt-2">Importo da allocare: {(riga.dare || riga.avere).toFixed(2)} €</p>
      <div className="mt-4">
        <p className="text-sm text-muted-foreground">Form di allocazione non ancora implementato.</p>
        <p className="text-sm text-muted-foreground">Seleziona Commessa e Voce Analitica qui.</p>
      </div>
      <div className="mt-6 flex justify-end">
        <Button onClick={() => {
          toast.info("Funzionalità in sviluppo.", { description: "L'allocazione non è ancora attiva."});
          onAllocationSuccess(); // Chiude il dialog per ora
        }}>
          Salva Allocazione
        </Button>
      </div>
    </div>
  );
};

const Riconciliazione: React.FC = () => {
  const [isAllocationDialogOpen, setIsAllocationDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<RigaScrittura | null>(null);

  const {
    data,
    totalCount,
    page,
    pageSize,
    search,
    sorting,
    loading,
    onPageChange,
    onPageSizeChange,
    onSearchChange,
    onSortingChange,
    fetchData,
  } = useAdvancedTable<RigaScrittura>({
    endpoint: '/api/registrazioni/non-allocate',
    initialSorting: [{ id: 'data', desc: true }],
  });

  const openAllocationDialog = (riga: RigaScrittura) => {
    setSelectedRow(riga);
    setIsAllocationDialogOpen(true);
  };
  
  const handleAllocationSuccess = () => {
    setIsAllocationDialogOpen(false);
    setSelectedRow(null);
    fetchData();
  };

  const columns: ColumnDef<RigaScrittura>[] = [
    {
      id: 'data',
      accessorKey: "scritturaContabile.data",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Data" />,
      cell: ({ row }) => row.original.scritturaContabile?.data ? new Date(row.original.scritturaContabile.data).toLocaleDateString('it-IT') : 'N/A',
    },
    {
      accessorKey: "descrizione",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Descrizione Riga" />,
    },
    {
      id: 'fornitore',
      accessorKey: "scritturaContabile.fornitore.nome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Soggetto" />,
      cell: ({ row }) => row.original.scritturaContabile?.fornitore?.nome || 'N/A'
    },
    {
      id: 'conto',
      accessorKey: "conto.nome",
      header: ({ column }) => <DataTableColumnHeader column={column} title="Conto" />,
    },
    {
      id: "importo",
      header: ({ column }) => <div className="text-right"><DataTableColumnHeader column={column} title="Importo" /></div>,
      cell: ({ row }) => {
        const importo = row.original.dare || row.original.avere;
        return <div className="text-right font-medium">{importo.toFixed(2)} €</div>
      }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const riga = row.original;
            return (
                <div className="text-center">
                   <Button onClick={() => openAllocationDialog(riga)}>
                      <Coins className="mr-2 h-4 w-4" /> Alloca
                   </Button>
                </div>
            )
        }
    }
  ];

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Centro di Riconciliazione</h1>
            <p className="text-muted-foreground">
              Alloca le righe di costo e ricavo importate alle commesse di competenza.
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Righe da Allocare</CardTitle>
          </CardHeader>
          <CardContent>
                <AdvancedDataTable
                  columns={columns}
                  data={data}
                  totalCount={totalCount}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={onPageChange}
                  onPageSizeChange={onPageSizeChange}
                  searchValue={search}
                  onSearchChange={onSearchChange}
                  sorting={sorting}
                  onSortingChange={onSortingChange}
                  loading={loading}
                  emptyMessage="Tutte le righe sono state allocate. Ottimo lavoro!"
                />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isAllocationDialogOpen} onOpenChange={setIsAllocationDialogOpen}>
        {selectedRow && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Alloca Riga Contabile</DialogTitle>
            </DialogHeader>
            <AllocationForm riga={selectedRow} onAllocationSuccess={handleAllocationSuccess} />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
};

export default Riconciliazione; 