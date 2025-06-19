import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Database as DatabaseIcon, RefreshCw, Edit, Trash2, Users, Building, FileText, Landmark, Library } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteRegistrazione } from '@/api/registrazioni';
import { useNavigate } from 'react-router-dom';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScritturaContabile, Commessa, Cliente, Fornitore, Conto, VoceAnalitica, RigaScrittura } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createCliente, updateCliente, deleteCliente } from '@/api/clienti';
import { createFornitore, updateFornitore, deleteFornitore } from '@/api/fornitori';

// Definiamo un'interfaccia aggregata per i dati del database
interface DatabaseData {
  scritture: ScritturaContabile[];
  commesse: Commessa[];
  clienti: Cliente[];
  fornitori: Fornitore[];
  conti: Conto[];
  vociAnalitiche: VoceAnalitica[];
  stats: {
    totaleScrittureContabili: number;
    totaleCommesse: number;
    totaleClienti: number;
    totaleFornitori: number;
    totaleConti: number;
    totaleVociAnalitiche: number;
  };
}

type TableKey = 'scritture' | 'commesse' | 'clienti' | 'fornitori' | 'conti' | 'vociAnalitiche';

const tableConfig: { key: TableKey; label: string; icon: React.ElementType }[] = [
    { key: 'scritture', label: 'Scritture', icon: FileText },
    { key: 'commesse', label: 'Commesse', icon: Building },
    { key: 'clienti', label: 'Clienti', icon: Users },
    { key: 'fornitori', label: 'Fornitori', icon: Landmark },
    { key: 'conti', label: 'Piano dei Conti', icon: Library },
    { key: 'vociAnalitiche', label: 'Voci Analitiche', icon: Landmark },
];

const PlaceholderTable = ({ title }: { title: string }) => (
    <Card>
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p>Gestione CRUD per questa tabella in fase di implementazione.</p>
        </CardContent>
    </Card>
);

const baseSchema = z.object({
  nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  externalId: z.string().optional(),
});

const ClientiTable = ({ data, onDataChange }: { data: Cliente[], onDataChange: () => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [deletingCliente, setDeletingCliente] = useState<Cliente | null>(null);

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: { nome: "", externalId: "" },
  });

  const handleOpenDialog = (cliente: Cliente | null = null) => {
    setEditingCliente(cliente);
    if (cliente) {
      form.reset({ nome: cliente.nome, externalId: cliente.externalId || "" });
    } else {
      form.reset({ nome: "", externalId: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof baseSchema>) => {
    try {
      if (editingCliente) {
        await updateCliente(editingCliente.id, values);
        toast.success("Cliente aggiornato con successo.");
      } else {
        await createCliente(values as { nome: string; externalId?: string });
        toast.success("Cliente creato con successo.");
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingCliente) return;
    try {
        await deleteCliente(deletingCliente.id);
        toast.success("Cliente eliminato con successo.");
        onDataChange();
    } catch(error) {
        toast.error((error as Error).message);
    } finally {
        setDeletingCliente(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clienti</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Cliente</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID Esterno</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cliente) => (
                <TableRow key={cliente.id}>
                  <TableCell>{cliente.nome}</TableCell>
                  <TableCell>{cliente.externalId || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(cliente)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingCliente(cliente)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingCliente ? 'Modifica Cliente' : 'Nuovo Cliente'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Nome Cliente" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="externalId"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>ID Esterno (opzionale)</FormLabel>
                                  <FormControl>
                                      <Input placeholder="ID del sistema esterno" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <DialogFooter>
                          <Button type="submit">Salva</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingCliente} onOpenChange={() => setDeletingCliente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare il cliente "{deletingCliente?.nome}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const FornitoriTable = ({ data, onDataChange }: { data: Fornitore[], onDataChange: () => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFornitore, setEditingFornitore] = useState<Fornitore | null>(null);
  const [deletingFornitore, setDeletingFornitore] = useState<Fornitore | null>(null);

  const form = useForm<z.infer<typeof baseSchema>>({
    resolver: zodResolver(baseSchema),
    defaultValues: { nome: "", externalId: "" },
  });

  const handleOpenDialog = (fornitore: Fornitore | null = null) => {
    setEditingFornitore(fornitore);
    if (fornitore) {
      form.reset({ nome: fornitore.nome, externalId: fornitore.externalId || "" });
    } else {
      form.reset({ nome: "", externalId: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof baseSchema>) => {
    try {
      if (editingFornitore) {
        await updateFornitore(editingFornitore.id, values);
        toast.success("Fornitore aggiornato con successo.");
      } else {
        await createFornitore(values as { nome: string; externalId?: string });
        toast.success("Fornitore creato con successo.");
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingFornitore) return;
    try {
        await deleteFornitore(deletingFornitore.id);
        toast.success("Fornitore eliminato con successo.");
        onDataChange();
    } catch(error) {
        toast.error((error as Error).message);
    } finally {
        setDeletingFornitore(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Fornitori</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Fornitore</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>ID Esterno</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((fornitore) => (
                <TableRow key={fornitore.id}>
                  <TableCell>{fornitore.nome}</TableCell>
                  <TableCell>{fornitore.externalId || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(fornitore)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingFornitore(fornitore)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingFornitore ? 'Modifica Fornitore' : 'Nuovo Fornitore'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Nome Fornitore" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="externalId"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>ID Esterno (opzionale)</FormLabel>
                                  <FormControl>
                                      <Input placeholder="ID del sistema esterno" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <DialogFooter>
                          <Button type="submit">Salva</Button>
                      </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingFornitore} onOpenChange={() => setDeletingFornitore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare il fornitore "{deletingFornitore?.nome}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const ScrittureTable = ({ data, onDataChange }: { data: ScritturaContabile[], onDataChange: () => void }) => {
    const [scritturaDaEliminare, setScritturaDaEliminare] = useState<ScritturaContabile | null>(null);
    const navigate = useNavigate();

    const handleDelete = async () => {
        if (!scritturaDaEliminare) return;
        try {
            await deleteRegistrazione(scritturaDaEliminare.id);
            toast.success("Scrittura eliminata con successo.");
            onDataChange();
        } catch (error) {
            toast.error("Errore durante l'eliminazione della scrittura.");
        } finally {
            setScritturaDaEliminare(null);
        }
    };
    
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Scritture Contabili</CardTitle>
              {/* Qui potrebbe andare un pulsante "Aggiungi" */}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrizione</TableHead>
                    <TableHead>Causale</TableHead>
                    <TableHead>Totale</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((scrittura) => {
                    const totaleMovimento = scrittura.righe.reduce((sum: number, riga: RigaScrittura) => sum + riga.dare, 0);
                    return (
                      <TableRow key={scrittura.id}>
                        <TableCell>{new Date(scrittura.data).toLocaleDateString('it-IT')}</TableCell>
                        <TableCell className="max-w-xs truncate">{scrittura.descrizione}</TableCell>
                        <TableCell>
                          <Badge variant={scrittura.causaleId === 'IMPORT' ? 'secondary' : 'default'}>
                            {scrittura.causaleId}
                          </Badge>
                        </TableCell>
                        <TableCell>€{totaleMovimento.toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon" onClick={() => navigate(`/prima-nota/modifica/${scrittura.id}`)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setScritturaDaEliminare(scrittura)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
            <AlertDialog open={!!scritturaDaEliminare} onOpenChange={() => setScritturaDaEliminare(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Sei sicuro di voler eliminare questa scrittura?</AlertDialogTitle>
                      <AlertDialogDescription>
                      Questa azione non può essere annullata.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel>Annulla</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Elimina
                      </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

const Database: React.FC = () => {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTable, setSelectedTable] = useState<TableKey>('scritture');

  const fetchDatabaseData = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/database');
      const result = await response.json();
      setData(result);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Errore nel caricamento dati database:', error);
      toast.error("Errore nel caricamento dei dati del database.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const renderSelectedTable = () => {
    if (!data) return null;
    switch (selectedTable) {
        case 'scritture':
            return <ScrittureTable data={data.scritture} onDataChange={() => fetchDatabaseData(false)} />;
        case 'commesse':
            return <PlaceholderTable title="Commesse" />;
        case 'clienti':
            return <ClientiTable data={data.clienti} onDataChange={() => fetchDatabaseData(false)} />;
        case 'fornitori':
            return <FornitoriTable data={data.fornitori} onDataChange={() => fetchDatabaseData(false)} />;
        case 'conti':
            return <PlaceholderTable title="Piano dei Conti" />;
        case 'vociAnalitiche':
            return <PlaceholderTable title="Voci Analitiche" />;
        default:
            return <p>Seleziona una tabella</p>;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Caricamento dati...</p>
      </div>
    )
  }

  if (!data) {
    return <div className="p-4">Errore nel caricamento dei dati. Prova ad aggiornare.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-slate-50">
        <header className="flex justify-between items-center p-4 border-b bg-white">
            <div className="flex items-center gap-3">
                <DatabaseIcon className="h-6 w-6" />
                <div>
                    <h1 className="text-xl font-bold">Amministrazione Database</h1>
                    <p className="text-sm text-muted-foreground">
                        Ultimo aggiornamento: {lastUpdate.toLocaleTimeString('it-IT')}
                    </p>
                </div>
            </div>
            <Button onClick={() => fetchDatabaseData(false)} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Aggiorna
            </Button>
        </header>

        <ResizablePanelGroup direction="horizontal" className="flex-grow">
            <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-white">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-4">Tabelle</h2>
                    <nav className="flex flex-col space-y-1">
                        {tableConfig.map(({ key, label, icon: Icon }) => (
                            <Button
                                key={key}
                                variant={selectedTable === key ? 'secondary' : 'ghost'}
                                className="w-full justify-start"
                                onClick={() => setSelectedTable(key)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {label}
                            </Button>
                        ))}
                    </nav>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80}>
                <div className="p-4 h-full overflow-auto">
                    {renderSelectedTable()}
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    </div>
  );
};

export default Database;
