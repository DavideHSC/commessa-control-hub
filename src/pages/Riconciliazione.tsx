import React, { useState, useEffect, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ColumnDef, ExpandedState } from "@tanstack/react-table";
import { MoreHorizontal, PlusCircle, Trash2, ChevronDown, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

// Tipi dal DB
import type { ImportScritturaTestata, ImportScritturaRigaContabile, CausaleContabile, Fornitore } from '@prisma/client';

// Tipi Aggiornati
type Allocation = {
  id: string;
  commessaId: string;
  commessaNome: string;
  importo: number;
  suggerimento: boolean;
};

type ReconciliationRow = {
  id:string;
  dataRegistrazione: string;
  codiceConto: string;
  descrizioneConto: string;
  descrizioneRiga: string;
  importo: number;
  totaleAllocato: number;
  status: 'Allocata' | 'Da Allocare' | 'Allocazione Parziale';
  tipo: 'Costo' | 'Ricavo';
  allocazioni: Allocation[];
};

type Commessa = {
  id: string;
  nome: string;
};

// Tipi per il nuovo Dialog
type MovimentoRiga = ImportScritturaRigaContabile & { descrizioneConto: string };
type MovimentoDetails = {
  testata: ImportScritturaTestata & {
    causale: CausaleContabile | null;
    fornitore: Fornitore | null;
  };
  righe: MovimentoRiga[];
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

const fetchMovimento = async (rowId: string): Promise<MovimentoDetails> => {
  const res = await fetch(`/api/reconciliation/movimento/${rowId}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || 'Errore nel recupero del movimento contabile');
  }
  return res.json();
};

// Componente Dialog per il dettaglio del movimento
const MovimentoDialog = ({ rowId, open, onOpenChange }: { rowId: string | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const { data, isLoading, error } = useQuery<MovimentoDetails, Error>({
    queryKey: ['movimento', rowId],
    queryFn: () => fetchMovimento(rowId!),
    enabled: !!rowId,
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '';
    return `€ ${value.toFixed(2)}`;
  }

  const totalDare = data?.righe.reduce((acc, r) => acc + (r.importoDare || 0), 0) || 0;
  const totalAvere = data?.righe.reduce((acc, r) => acc + (r.importoAvere || 0), 0) || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Dettaglio Movimento Contabile</DialogTitle>
        </DialogHeader>
        {isLoading && <div className='p-6'>Caricamento in corso...</div>}
        {error && <div className='p-6 text-red-600'>Errore: {error.message}</div>}
        {data && (
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                    <span className="font-semibold text-gray-600 block">Causale</span> 
                    {data.testata.causale?.descrizione || data.testata.descrizioneCausale || 'N/D'}
                </div>
                <div>
                    <span className="font-semibold text-gray-600 block">Fornitore</span> 
                    {data.testata.fornitore?.nome || 'Nessuno'}
                </div>
                <div><span className="font-semibold text-gray-600">Data Reg:</span> {new Date(data.testata.dataRegistrazione!).toLocaleDateString()}</div>
                <div><span className="font-semibold text-gray-600">Num. Doc:</span> {data.testata.numeroDocumento}</div>
                <div><span className="font-semibold text-gray-600">Data Doc:</span> {data.testata.dataDocumento ? new Date(data.testata.dataDocumento).toLocaleDateString() : 'N/D'}</div>
                <div className="col-span-2"><span className="font-semibold text-gray-600">Note:</span> {data.testata.noteMovimento}</div>
            </div>
            
            <table className="w-full text-sm">
                <thead className='bg-gray-100'>
                    <tr className='border-b'>
                        <th className="text-left py-2 px-2 font-medium">Conto</th>
                        <th className="text-left py-2 px-2 font-medium">Descrizione Conto</th>
                        <th className="text-left py-2 px-2 font-medium">Note Riga</th>
                        <th className="text-right py-2 px-2 font-medium">Dare</th>
                        <th className="text-right py-2 px-2 font-medium">Avere</th>
                    </tr>
                </thead>
                <tbody>
                    {data.righe.map(riga => (
                        <tr key={riga.id} className={`border-b ${riga.id === rowId ? 'bg-blue-50' : ''}`}>
                            <td className="py-2 px-2">{riga.codiceConto}</td>
                            <td className="py-2 px-2">{riga.descrizioneConto}</td>
                            <td className="py-2 px-2 italic">{riga.note}</td>
                            <td className="text-right py-2 px-2 font-mono">{formatCurrency(riga.importoDare)}</td>
                            <td className="text-right py-2 px-2 font-mono">{formatCurrency(riga.importoAvere)}</td>
                        </tr>
                    ))}
                </tbody>
                 <tfoot className="font-bold bg-gray-100">
                    <tr>
                        <td colSpan={3} className="text-right py-2 px-2">TOTALI</td>
                        <td className="text-right py-2 px-2 font-mono">{formatCurrency(totalDare)}</td>
                        <td className="text-right py-2 px-2 font-mono">{formatCurrency(totalAvere)}</td>
                    </tr>
                </tfoot>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Componente Dialog per l'allocazione
const AllocationDialog = ({ row, open, onOpenChange }: { row: ReconciliationRow | null, open: boolean, onOpenChange: (open: boolean) => void }) => {
  const queryClient = useQueryClient();
  const [allocations, setAllocations] = useState<{commessaId: string, importo: number}[]>([]);

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
        if (commesse.length > 0) {
            const mappedAllocations = row.allocazioni.map(a => ({
                commessaId: a.commessaId,
                importo: a.importo
            }));

            if(mappedAllocations.length === 0) {
                setAllocations([{ commessaId: '', importo: row.importo }]);
            } else {
                setAllocations(mappedAllocations);
            }
        } else {
            setAllocations([{ commessaId: '', importo: row.importo }]);
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
    
    if (field === 'importo') {
        let newAmount = parseFloat(value as string);
        if (isNaN(newAmount)) newAmount = 0;
        
        const otherAllocationsTotal = newAllocations
            .filter((_, i) => i !== index)
            .reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
            
        const maxAllowed = (row?.importo || 0) - otherAllocationsTotal;

        if (newAmount > maxAllowed) {
            newAmount = maxAllowed;
            toast.info(`L'importo è stato aggiustato per non superare il totale.`, {
                description: `Massimo disponibile: € ${maxAllowed.toFixed(2)}`,
            });
        }
        newAllocations[index] = { ...newAllocations[index], importo: newAmount };
    } else {
        newAllocations[index] = { ...newAllocations[index], [field]: value as string };
    }

    setAllocations(newAllocations);
  };

  const addAllocation = () => {
    const totalAllocated = allocations.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
    const remainingAmount = (row?.importo || 0) - totalAllocated;
    setAllocations([...allocations, { commessaId: '', importo: Math.max(0, remainingAmount) }]);
  };
  const removeAllocation = (index: number) => setAllocations(allocations.filter((_, i) => i !== index));

  const totalAllocated = allocations.reduce((sum, alloc) => sum + (alloc.importo || 0), 0);
  const remaining = (row?.importo || 0) - totalAllocated;

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Modifica Allocazione</DialogTitle>
          <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700">
              <span className="font-semibold">Conto:</span> {row.codiceConto} - {row.descrizioneConto}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Data:</span> {new Date(row.dataRegistrazione).toLocaleDateString()}
            </div>
            <div className="text-lg font-bold text-blue-600">
              Importo Totale: € {row.importo.toFixed(2)}
            </div>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-gray-600 border-b pb-2">
            <div className="col-span-6">Commessa</div>
            <div className="col-span-4 text-right">Importo (€)</div>
            <div className="col-span-2"></div>
          </div>
          {allocations.map((alloc, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-center">
              <div className="col-span-6">
                <Select value={alloc.commessaId} onValueChange={(value) => updateAllocation(index, 'commessaId', value)}>
                  <SelectTrigger><SelectValue placeholder="Seleziona Commessa" /></SelectTrigger>
                  <SelectContent>
                    {commesse.map(c => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4">
                <Input
                  type="number"
                  step="0.01"
                  value={alloc.importo}
                  onChange={(e) => updateAllocation(index, 'importo', e.target.value)}
                  className="text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <Button variant="outline" size="icon" onClick={() => removeAllocation(index)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          <Button variant="outline" onClick={addAllocation} className="mt-4 w-full"><PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Riga</Button>
        </div>
        <DialogFooter>
          <div className="w-full">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-4">
              <div className="space-y-1">
                <div className="text-sm text-gray-600">Totale Allocato: <span className="font-medium">€ {totalAllocated.toFixed(2)}</span></div>
                <div className="text-sm">
                  Residuo: <span className={`font-bold ${Math.abs(remaining) < 0.005 ? 'text-green-600' : 'text-red-600'}`}>
                    € {remaining.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">
                  {Math.abs(remaining) < 0.005 ? '✓ Completamente allocato' : '⚠ Allocazione incompleta'}
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Annulla
              </Button>
              <Button onClick={handleSave} disabled={mutation.isPending || Math.abs(remaining) > 0.005}>
                {mutation.isPending ? 'Salvataggio...' : 'Salva Allocazioni'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


const RiconciliazionePage = () => {
  const [isAllocDialogOpen, setIsAllocDialogOpen] = useState(false);
  const [isMovimentoDialogOpen, setIsMovimentoDialogOpen] = useState(false);
  
  const [selectedRow, setSelectedRow] = useState<ReconciliationRow | null>(null);
  const [selectedMovimentoRowId, setSelectedMovimentoRowId] = useState<string | null>(null);

  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const { data, isLoading, error } = useQuery<ReconciliationRow[], Error>({ queryKey: ['stagingRows'], queryFn: fetchStagingRows });

  const handleOpenAllocDialog = (row: ReconciliationRow) => {
    setSelectedRow(row);
    setIsAllocDialogOpen(true);
  };

  const handleOpenMovimentoDialog = (row: ReconciliationRow) => {
    setSelectedMovimentoRowId(row.id);
    setIsMovimentoDialogOpen(true);
  };

  const columns: ColumnDef<ReconciliationRow>[] = [
    {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: 'pointer' },
            }}
          >
            {row.getIsExpanded() ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        ) : null;
      },
    },
    { accessorKey: "dataRegistrazione", header: "Data Reg.", cell: ({ row }) => new Date(row.original.dataRegistrazione).toLocaleDateString() },
    {
        accessorKey: "conto",
        header: "Conto",
        cell: ({ row }) => (
            <div>
                <div className="font-medium">{row.original.codiceConto}</div>
                <div className="text-xs text-gray-500">{row.original.descrizioneConto}</div>
            </div>
        )
    },
    { 
        accessorKey: "tipo", 
        header: "Tipo",
        cell: ({ row }) => {
            const tipo = row.original.tipo;
            return <Badge variant={tipo === 'Costo' ? 'destructive' : 'default'} className={tipo === 'Ricavo' ? 'bg-green-600' : ''}>{tipo}</Badge>;
        }
    },
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
            <DropdownMenuItem onClick={() => handleOpenAllocDialog(row.original)}>Modifica Allocazione</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOpenMovimentoDialog(row.original)}>Dettaglio Movimento</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return <div>Caricamento in corso...</div>;
  if (error) return <div>Errore nel caricamento dei dati: {error.message}</div>;

  const renderRowSubComponent = ({ row }: { row: any }) => {
    const { allocazioni, descrizioneRiga } = row.original as ReconciliationRow;
    return (
        <td colSpan={columns.length} className="p-4 bg-gray-50">
            {descrizioneRiga && <p className="text-sm text-gray-600 mb-3 italic"><strong>Note riga:</strong> {descrizioneRiga}</p>}
            <h4 className="font-bold mb-2">Dettaglio Allocazioni:</h4>
            {allocazioni.length > 0 ? (
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-1 px-2 font-medium">Commessa</th>
                            <th className="text-right py-1 px-2 font-medium">Importo</th>
                            <th className="text-center py-1 px-2 font-medium">Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocazioni.map((alloc: Allocation) => (
                            <tr key={alloc.id} className="border-b border-gray-200">
                                <td className="py-2 px-2">{alloc.commessaNome}</td>
                                <td className="text-right py-2 px-2">€ {alloc.importo.toFixed(2)}</td>
                                <td className="text-center py-2 px-2">
                                    <Badge variant={alloc.suggerimento ? "secondary" : "default"}>
                                        {alloc.suggerimento ? "Automatico" : "Manuale"}
                                    </Badge>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p className="text-sm text-gray-500">Nessuna allocazione presente.</p>}
        </td>
    );
};

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
            <h1 className="text-2xl font-bold">Scrivania di Riconciliazione</h1>
            <p className="text-gray-600">Associa ogni costo o ricavo alla commessa di competenza.</p>
        </div>
      </div>

      <AdvancedDataTable
        columns={columns}
        data={data ?? []}
        getRowCanExpand={() => true}
        renderRowSubComponent={renderRowSubComponent}
        expanded={expanded}
        onExpandedChange={setExpanded}
      />

      <AllocationDialog 
        open={isAllocDialogOpen} 
        onOpenChange={setIsAllocDialogOpen}
        row={selectedRow} 
      />

      <MovimentoDialog
        rowId={selectedMovimentoRowId}
        open={isMovimentoDialogOpen}
        onOpenChange={setIsMovimentoDialogOpen}
      />
    </div>
  );
};

export default RiconciliazionePage; 