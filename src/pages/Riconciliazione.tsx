import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

// Tipi
type Allocation = {
  id: string;
  commessaNome: string;
  importo: number;
};
type ReconciliationRow = {
  id: string;
  dataRegistrazione: string;
  descrizione: string;
  importo: number;
  totaleAllocato: number;
  status: 'Allocata' | 'Da Allocare' | 'Allocazione Parziale';
  allocazioni: Allocation[];
};
type Commessa = {
  id: string;
  nome: string;
};

// API Fetching
const fetchStagingRows = async (): Promise<ReconciliationRow[]> => {
  const res = await fetch('/api/reconciliation/staging-rows');
  if (!res.ok) throw new Error('Errore nel recupero delle righe');
  return res.json();
};
const fetchCommesse = async (): Promise<Commessa[]> => {
  const res = await fetch('/api/commesse');
  if (!res.ok) throw new Error('Errore nel recupero delle commesse');
  const result = await res.json();
  return result.data;
};
const updateAllocations = async ({ rowId, allocations }: { rowId: string, allocations: { commessaId: string, importo: number }[] }) => {
  const res = await fetch(`/api/reconciliation/allocations/${rowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocations),
  });
  if (!res.ok) throw new Error('Errore nell\'aggiornamento delle allocazioni');
  return res.json();
};

// Componente Dialog per l'allocazione
const AllocationDialog = ({ row, open, onOpenChange }: { row: ReconciliationRow | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState(row?.allocazioni.map(a => ({ commessaId: a.id, importo: a.importo })) || []);

  const { data: commesse = [] } = useQuery<Commessa[]>({ queryKey: ['commesse'], queryFn: fetchCommesse });
  
  const mutation = useMutation({
    mutationFn: updateAllocations,
    onSuccess: () => {
      toast.success('Allocazioni salvate con successo');
      queryClient.invalidateQueries({ queryKey: ['stagingRows'] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Salvataggio fallito: ${error.message}`);
    }
  });

  useEffect(() => {
    if (row) {
        // Quando la riga cambia, reimposta lo stato delle allocazioni
        // Mappiamo l'ID della commessa, non dell'allocazione
        const mappedAllocations = row.allocazioni.map(a => {
            const commessa = commesse.find(c => c.nome === a.commessaNome);
            return { commessaId: commessa?.id || '', importo: a.importo };
        }).filter(a => a.commessaId); // Filtra quelle senza ID trovato

        // Se non ci sono allocazioni esistenti, aggiungine una vuota per iniziare
        if(mappedAllocations.length === 0) {
            setAllocations([{ commessaId: '', importo: row.importo }]);
        } else {
            setAllocations(mappedAllocations);
        }
    }
  }, [row, commesse]);


  const handleSave = () => {
    if (row) {
      mutation.mutate({ rowId: row.id, allocations });
    }
  };

  const updateAllocation = (index: number, field: 'commessaId' | 'importo', value: string | number) => {
    const newAllocations = [...allocations];
    const parsedValue = typeof value === 'string' && field === 'importo' ? parseFloat(value) : value;
    newAllocations[index] = { ...newAllocations[index], [field]: parsedValue };
    setAllocations(newAllocations);
  };

  const addAllocation = () => setAllocations([...allocations, { commessaId: '', importo: 0 }]);
  const removeAllocation = (index: number) => setAllocations(allocations.filter((_, i) => i !== index));

  const totalAllocated = allocations.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
  const remaining = (row?.importo || 0) - totalAllocated;

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Modifica Allocazione</DialogTitle>
          <div>{row.descrizione}</div>
          <div className="font-bold">Importo Totale: € {row.importo.toFixed(2)}</div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {allocations.map((alloc, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select value={alloc.commessaId} onValueChange={(value) => updateAllocation(index, 'commessaId', value)}>
                <SelectTrigger><SelectValue placeholder="Seleziona Commessa" /></SelectTrigger>
                <SelectContent>
                  {commesse.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                type="number"
                value={alloc.importo}
                onChange={(e) => updateAllocation(index, 'importo', e.target.value)}
                className="w-[120px]"
              />
              <Button variant="outline" size="icon" onClick={() => removeAllocation(index)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          ))}
          <Button variant="outline" onClick={addAllocation} className="mt-2"><PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Riga</Button>
        </div>
        <DialogFooter>
          <div className="w-full flex justify-between items-center">
            <div>Residuo: <span className={remaining === 0 ? 'text-green-600' : 'text-red-600'}>€ {remaining.toFixed(2)}</span></div>
            <Button onClick={handleSave} disabled={mutation.isPending}>
              {mutation.isPending ? 'Salvataggio...' : 'Salva Allocazioni'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const RiconciliazionePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ReconciliationRow | null>(null);

  const { data, isLoading, error } = useQuery<ReconciliationRow[], Error>({ queryKey: ['stagingRows'], queryFn: fetchStagingRows });

  const handleOpenDialog = (row: ReconciliationRow) => {
    setSelectedRow(row);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<ReconciliationRow>[] = [
    { accessorKey: "dataRegistrazione", header: "Data Reg.", cell: ({ row }) => new Date(row.original.dataRegistrazione).toLocaleDateString() },
    { accessorKey: "descrizione", header: "Descrizione" },
    { accessorKey: "importo", header: "Importo", cell: ({ row }) => `€ ${row.original.importo.toFixed(2)}` },
    { accessorKey: "totaleAllocato", header: "Allocato", cell: ({ row }) => `€ ${row.original.totaleAllocato.toFixed(2)}` },
    { accessorKey: "status", header: "Stato" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Apri</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Azioni</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handleOpenDialog(row.original)}>Modifica Allocazione</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return <div>Caricamento in corso...</div>;
  if (error) return <div>Errore nel caricamento dei dati: {error.message}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Scrivania di Riconciliazione</h1>
      <p className="mb-6 text-gray-600">
        Associa ogni costo o ricavo alla commessa di competenza.
      </p>
      
      {data && <DataTable columns={columns} data={data} />}

      <AllocationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        row={selectedRow}
      />
    </div>
  );
};

export default RiconciliazionePage; 