import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegoleRipartizione, createRegolaRipartizione, updateRegolaRipartizione, deleteRegolaRipartizione, RegolaRipartizioneInput } from '@/api/regoleRipartizione';
import { getContiPerSelezione } from '@/api/conti';
import { getCommessePerSelezione } from '@/api/commesse';
import { getVociAnalitichePerSelezione } from '@/api/vociAnalitiche';
import { RegolaRipartizione, Conto, Commessa, VoceAnalitica } from '@/types';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Trash2, PlusCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";


type SelectOptions = {
    value: string;
    label: string;
}

type RegolaFormProps = {
  rule?: RegolaRipartizione | null;
  onSave: (data: RegolaRipartizioneInput) => void;
  onClose: () => void;
  conti: SelectOptions[];
  commesse: SelectOptions[];
  vociAnalitiche: SelectOptions[];
};

function RegolaForm({ rule, onSave, onClose, conti, commesse, vociAnalitiche }: RegolaFormProps) {
  const [formData, setFormData] = useState<RegolaRipartizioneInput>({
    descrizione: rule?.descrizione || '',
    percentuale: rule?.percentuale || 0,
    contoId: rule?.contoId || '',
    commessaId: rule?.commessaId || '',
    voceAnaliticaId: rule?.voceAnaliticaId || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  const handleValueChange = (name: keyof RegolaRipartizioneInput, value: string | number) => {
      setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="descrizione">Descrizione</Label>
        <Input id="descrizione" value={formData.descrizione} onChange={(e) => handleValueChange('descrizione', e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="percentuale">Percentuale (%)</Label>
        <Input id="percentuale" type="number" min="0" max="100" value={formData.percentuale} onChange={(e) => handleValueChange('percentuale', parseFloat(e.target.value))} required />
      </div>
      <div>
        <Label htmlFor="contoId">Conto</Label>
        <Select onValueChange={(value) => handleValueChange('contoId', value)} value={formData.contoId} required>
          <SelectTrigger><SelectValue placeholder="Seleziona un conto" /></SelectTrigger>
          <SelectContent>
            {conti.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="commessaId">Commessa</Label>
        <Select onValueChange={(value) => handleValueChange('commessaId', value)} value={formData.commessaId} required>
          <SelectTrigger><SelectValue placeholder="Seleziona una commessa" /></SelectTrigger>
          <SelectContent>
            {commesse.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
       <div>
        <Label htmlFor="voceAnaliticaId">Voce Analitica</Label>
        <Select onValueChange={(value) => handleValueChange('voceAnaliticaId', value)} value={formData.voceAnaliticaId} required>
          <SelectTrigger><SelectValue placeholder="Seleziona una voce" /></SelectTrigger>
          <SelectContent>
            {vociAnalitiche.map(v => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
        <Button type="submit">Salva</Button>
      </DialogFooter>
    </form>
  );
}


export function RegoleRipartizioneManager() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RegolaRipartizione | null>(null);

  const { data: regole = [], isLoading: isLoadingRules } = useQuery<RegolaRipartizione[]>({
    queryKey: ['regoleRipartizione'],
    queryFn: getRegoleRipartizione,
  });
  
  const { data: conti = [] } = useQuery<Pick<Conto, 'id' | 'codice' | 'nome'>[]>({
    queryKey: ['contiPerSelezione'],
    queryFn: getContiPerSelezione,
  });

  const { data: commesse = [] } = useQuery<Pick<Commessa, 'id' | 'nome'>[]>({
    queryKey: ['commessePerSelezione'],
    queryFn: getCommessePerSelezione,
  });

  const { data: vociAnalitiche = [] } = useQuery<Pick<VoceAnalitica, 'id' | 'nome'>[]>({
    queryKey: ['vociAnalitichePerSelezione'],
    queryFn: getVociAnalitichePerSelezione,
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regoleRipartizione'] });
      setIsDialogOpen(false);
      setSelectedRule(null);
    },
    onError: (error: Error) => {
      toast({
        title: 'Errore',
        description: error.message,
        variant: 'destructive',
      });
    },
  };

  const createMutation = useMutation({
      mutationFn: createRegolaRipartizione, 
      ...mutationOptions,
      onSuccess: () => {
          mutationOptions.onSuccess();
          toast({ title: 'Successo', description: 'Regola creata con successo.' });
      }
  });

  const updateMutation = useMutation({
      mutationFn: ({ id, data }: { id: string, data: RegolaRipartizioneInput }) => updateRegolaRipartizione(id, data),
      ...mutationOptions,
      onSuccess: () => {
          mutationOptions.onSuccess();
          toast({ title: 'Successo', description: 'Regola aggiornata con successo.' });
      }
  });

  const deleteMutation = useMutation({
      mutationFn: deleteRegolaRipartizione,
      ...mutationOptions,
      onSuccess: () => {
          mutationOptions.onSuccess();
          toast({ title: 'Successo', description: 'Regola eliminata con successo.' });
      }
  });

  const handleSave = (data: RegolaRipartizioneInput) => {
    if (selectedRule) {
      updateMutation.mutate({ id: selectedRule.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const openNewDialog = () => {
    setSelectedRule(null);
    setIsDialogOpen(true);
  }

  const openEditDialog = (rule: RegolaRipartizione) => {
    setSelectedRule(rule);
    setIsDialogOpen(true);
  }

  const handleDelete = (id: string) => {
      deleteMutation.mutate(id);
  }
  
  const contiOptions = conti.map(c => ({ value: c.id, label: `${c.codice} - ${c.nome}` }));
  const commesseOptions = commesse.map(c => ({ value: c.id, label: c.nome }));
  const vociAnaliticheOptions = vociAnalitiche.map(v => ({ value: v.id, label: v.nome }));


  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestione Regole di Ripartizione</h1>
        <Button onClick={openNewDialog}><PlusCircle className="mr-2 h-4 w-4"/>Nuova Regola</Button>
      </div>
      
       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{selectedRule ? 'Modifica Regola' : 'Crea Nuova Regola'}</DialogTitle>
            </DialogHeader>
             <RegolaForm 
                rule={selectedRule} 
                onSave={handleSave} 
                onClose={() => setIsDialogOpen(false)}
                conti={contiOptions}
                commesse={commesseOptions}
                vociAnalitiche={vociAnaliticheOptions}
            />
        </DialogContent>
      </Dialog>


      {isLoadingRules ? (
        <p>Caricamento delle regole...</p>
      ) : (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Conto</TableHead>
                    <TableHead>Commessa</TableHead>
                    <TableHead>Voce Analitica</TableHead>
                    <TableHead className="text-right">Percentuale</TableHead>
                    <TableHead className="w-[100px]">Azioni</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {regole.map((regola) => (
                    <TableRow key={regola.id}>
                        <TableCell>{regola.descrizione}</TableCell>
                        <TableCell>{regola.conto.nome} ({regola.conto.codice})</TableCell>
                        <TableCell>{regola.commessa.nome}</TableCell>
                        <TableCell>{regola.voceAnalitica.nome}</TableCell>
                        <TableCell className="text-right">{regola.percentuale}%</TableCell>
                        <TableCell className="space-x-2 flex items-center">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(regola)}><Pencil className="h-4 w-4" /></Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Questa azione non può essere annullata. Questa operazione eliminerà permanentemente la regola.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Annulla</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(regola.id)}>Elimina</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
      )}
    </div>
  );
} 