import React, { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, Row } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


// =============================================================================
// TIPI AGGIORNATI (V2 - VISTA PER SCRITTURA)
// =============================================================================

type Allocation = {
  id: string;
  commessaNome: string;
  importo: number;
};

type RigaContabile = {
  id: string;
  descrizione: string;
  dare: number;
  avere: number;
  conto: {
    codice: string;
    nome: string;
  };
  allocazioni: Allocation[];
};

// Il tipo principale ora rappresenta l'intera scrittura contabile
type ReconciliationTransaction = {
  id: string;
  data: string;
  descrizione: string;
  numeroDocumento: string | null;
  importo: number; // calcolato dal backend
  totaleAllocato: number; // calcolato dal backend
  status: 'Allocata' | 'Da Allocare' | 'Allocazione Parziale'; // calcolato dal backend
  righe: RigaContabile[];
};

type Commessa = {
  id: string;
  nome: string;
};


// =============================================================================
// API FETCHING (Logica invariata, endpoint è lo stesso)
// =============================================================================

const fetchReconciliationTransactions = async (): Promise<ReconciliationTransaction[]> => {
  const res = await fetch('/api/reconciliation/staging-rows');
  if (!res.ok) throw new Error('Errore nel recupero delle scritture da riconciliare');
  return res.json();
};

const fetchCommesse = async (): Promise<Commessa[]> => {
  const res = await fetch('/api/commesse');
  if (!res.ok) throw new Error('Errore nel recupero delle commesse');
  const result = await res.json();
  return result.data;
};

// L'API di salvataggio rimane per riga, verrà gestita dal frontend
const updateAllocations = async ({ rowId, allocations }: { rowId: string, allocations: { commessaId: string, importo: number }[] }) => {
  const res = await fetch(`/api/reconciliation/allocations/${rowId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(allocations),
  });
  if (!res.ok) throw new Error('Errore nell\'aggiornamento delle allocazioni');
  return res.json();
};


// =============================================================================
// DIALOGO DI ALLOCAZIONE (V3 - GESTIONE COMPLETA)
// =============================================================================

// Stato per le allocazioni nel dialogo
type AllocationState = {
  [rigaId: string]: {
    commessaId: string;
    importo: number;
  }[];
};

const AllocationDialog = ({ transaction, open, onOpenChange }: { transaction: ReconciliationTransaction | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState<AllocationState>({});

  const { data: commesse = [] } = useQuery<Commessa[]>({ queryKey: ['commesse'], queryFn: fetchCommesse });
  
  const mutation = useMutation({
    mutationFn: updateAllocations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliationTransactions'] });
    },
    // Non mostriamo toast di errore qui, lo gestiamo nel salvataggio aggregato
  });

  // Popola lo stato quando il dialogo si apre o la transazione cambia
  React.useEffect(() => {
    if (transaction) {
      const initialState: AllocationState = {};
      transaction.righe
        .filter(r => r.conto.codice?.startsWith('6') || r.conto.codice?.startsWith('7'))
        .forEach(riga => {
          initialState[riga.id] = riga.allocazioni.map(a => {
            const commessa = commesse.find(c => c.nome === a.commessaNome);
            return { commessaId: commessa?.id || '', importo: a.importo };
          }).filter(a => a.commessaId); // Includi solo quelle con commessa trovata
        });
      setAllocations(initialState);
    }
  }, [transaction, commesse, open]);


  const handleSave = async () => {
    if (!transaction) return;
    
    const promises = Object.entries(allocations).map(([rowId, allocs]) => {
      // Filtra le allocazioni vuote o con importo zero
      const validAllocs = allocs.filter(a => a.commessaId && a.importo > 0);
      return mutation.mutateAsync({ rowId, allocations: validAllocs });
    });

    try {
      await Promise.all(promises);
      toast.success('Tutte le allocazioni sono state salvate con successo!');
      onOpenChange(false);
    } catch (error) {
      toast.error(`Errore durante il salvataggio di una o più allocazioni. Controllare i dati e riprovare.`);
      // La query verrà invalidata comunque per mostrare lo stato reale
      queryClient.invalidateQueries({ queryKey: ['reconciliationTransactions'] });
    }
  };
  
  const updateAllocation = (rigaId: string, allocIndex: number, field: 'commessaId' | 'importo', value: string | number) => {
    const newAllocations = { ...allocations };
    const parsedValue = typeof value === 'string' && field === 'importo' ? parseFloat(value) || 0 : value;
    newAllocations[rigaId][allocIndex] = { ...newAllocations[rigaId][allocIndex], [field]: parsedValue };
    setAllocations(newAllocations);
  };

  const addAllocation = (rigaId: string) => {
    const newAllocations = { ...allocations };
    if (!newAllocations[rigaId]) newAllocations[rigaId] = [];
    newAllocations[rigaId].push({ commessaId: '', importo: 0 });
    setAllocations(newAllocations);
  };
  
  const removeAllocation = (rigaId: string, allocIndex: number) => {
    const newAllocations = { ...allocations };
    newAllocations[rigaId] = newAllocations[rigaId].filter((_, i) => i !== allocIndex);
    setAllocations(newAllocations);
  };


  if (!transaction) return null;

  const righeDaAllocare = transaction.righe.filter(r => r.conto.codice?.startsWith('6') || r.conto.codice?.startsWith('7'));
  const importoTotaleDaAllocare = righeDaAllocare.reduce((acc, r) => acc + (r.dare > 0 ? r.dare : r.avere), 0);
  const totaleAttualmenteAllocato = Object.values(allocations).flat().reduce((sum, alloc) => sum + alloc.importo, 0);
  const residuo = importoTotaleDaAllocare - totaleAttualmenteAllocato;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dettaglio Allocazione Movimento</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {transaction.descrizione} ({new Date(transaction.data).toLocaleDateString()})
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {righeDaAllocare.map(riga => (
            <div key={riga.id} className="p-4 border rounded-md">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{riga.conto.nome} ({riga.conto.codice})</div>
                <div className="font-bold text-lg">€ {(riga.dare > 0 ? riga.dare : riga.avere).toFixed(2)}</div>
              </div>
              <div className="space-y-2">
                {(allocations[riga.id] || []).map((alloc, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select value={alloc.commessaId} onValueChange={(value) => updateAllocation(riga.id, index, 'commessaId', value)}>
                      <SelectTrigger><SelectValue placeholder="Seleziona Commessa" /></SelectTrigger>
                      <SelectContent>
                        {commesse.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={alloc.importo}
                      onChange={(e) => updateAllocation(riga.id, index, 'importo', e.target.value)}
                      className="w-[150px]"
                    />
                    <Button variant="outline" size="icon" onClick={() => removeAllocation(riga.id, index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
                 <Button variant="outline" size="sm" onClick={() => addAllocation(riga.id)} className="mt-2">
                   <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Allocazione
                 </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="w-full flex justify-between items-center">
            <div>Residuo: <span className={Math.abs(residuo) < 0.01 ? 'text-green-600' : 'text-red-600'}>€ {residuo.toFixed(2)}</span></div>
            <div>
              <Button onClick={() => onOpenChange(false)} variant="outline" className="mr-2">Annulla</Button>
              <Button onClick={handleSave} disabled={mutation.isPending}>
                {mutation.isPending ? 'Salvataggio...' : 'Salva Tutte le Allocazioni'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// =============================================================================
// COMPONENTE PER SOTTO-RIGA
// =============================================================================

const SubRowComponent = ({ row }: { row: Row<ReconciliationTransaction> }) => {
  const transaction = row.original;
  return (
    <div className="p-4 bg-muted">
      <h4 className="font-bold mb-2">Dettaglio Righe</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Conto</TableHead>
            <TableHead>Descrizione Conto</TableHead>
            <TableHead className="text-right">Dare</TableHead>
            <TableHead className="text-right">Avere</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transaction.righe.map(riga => (
            <TableRow key={riga.id}>
              <TableCell>{riga.conto.codice}</TableCell>
              <TableCell>{riga.conto.nome}</TableCell>
              <TableCell className="text-right">{riga.dare > 0 ? `€ ${riga.dare.toFixed(2)}` : '-'}</TableCell>
              <TableCell className="text-right">{riga.avere > 0 ? `€ ${riga.avere.toFixed(2)}` : '-'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};


// =============================================================================
// PAGINA DI RICONCILIAZIONE (V2 - VISTA PER SCRITTURA)
// =============================================================================

const RiconciliazionePage = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ReconciliationTransaction | null>(null);

  const { data, isLoading, error } = useQuery<ReconciliationTransaction[], Error>({ 
    queryKey: ['reconciliationTransactions'], 
    queryFn: fetchReconciliationTransactions 
  });

  const handleOpenDialog = (transaction: ReconciliationTransaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const columns: ColumnDef<ReconciliationTransaction>[] = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return (
            <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                e.stopPropagation();
                row.toggleExpanded();
                }}
            >
                {row.getIsExpanded() ? <ChevronDown /> : <ChevronRight />}
            </Button>
        );
      },
    },
    { accessorKey: "data", header: "Data Reg.", cell: ({ row }) => new Date(row.original.data).toLocaleDateString() },
    { accessorKey: "descrizione", header: "Descrizione Scrittura" },
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
        Associa ogni movimento di costo o ricavo alla commessa di competenza.
      </p>
      
      {data && (
        <DataTable 
          columns={columns} 
          data={data}
          renderSubComponent={SubRowComponent}
          getRowCanExpand={() => true}
        />
      )}

      <AllocationDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default RiconciliazionePage; 