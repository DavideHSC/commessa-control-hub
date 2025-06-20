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
import { createVoceAnalitica, deleteVoceAnalitica, updateVoceAnalitica } from '@/api/vociAnalitiche';
import { createConto, deleteConto, updateConto } from '@/api/conti';
import { createCommessa, deleteCommessa, updateCommessa } from '@/api/commesse';
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipoConto } from '@prisma/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImportTemplatesAdmin from '@/components/admin/ImportTemplatesAdmin';

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

const VociAnaliticheTable = ({ data, onDataChange }: { data: VoceAnalitica[], onDataChange: () => void }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoce, setEditingVoce] = useState<VoceAnalitica | null>(null);
  const [deletingVoce, setDeletingVoce] = useState<VoceAnalitica | null>(null);

  const voceSchema = z.object({
    id: z.string().min(1, { message: "L'ID è obbligatorio." }),
    nome: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
    descrizione: z.string().optional(),
    externalId: z.string().optional(),
  });

  const form = useForm<z.infer<typeof voceSchema>>({
    resolver: zodResolver(voceSchema),
    defaultValues: { id: "", nome: "", descrizione: "", externalId: "" },
  });

  const handleOpenDialog = (voce: VoceAnalitica | null = null) => {
    setEditingVoce(voce);
    if (voce) {
      form.reset(voce);
    } else {
      form.reset({ id: "", nome: "", descrizione: "", externalId: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof voceSchema>) => {
    try {
      if (editingVoce) {
        await updateVoceAnalitica(editingVoce.id, values);
        toast.success("Voce analitica aggiornata con successo.");
      } else {
        await createVoceAnalitica(values as VoceAnalitica);
        toast.success("Voce analitica creata con successo.");
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingVoce) return;
    try {
        await deleteVoceAnalitica(deletingVoce.id);
        toast.success("Voce analitica eliminata con successo.");
        onDataChange();
    } catch(error) {
        toast.error("Impossibile eliminare: la voce potrebbe essere in uso.");
    } finally {
        setDeletingVoce(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Voci Analitiche</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Voce</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Descrizione</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((voce) => (
                <TableRow key={voce.id}>
                  <TableCell>
                    <Badge variant="outline">{voce.id}</Badge>
                  </TableCell>
                  <TableCell>{voce.nome}</TableCell>
                  <TableCell>{voce.descrizione || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(voce)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingVoce(voce)}><Trash2 className="h-4 w-4" /></Button>
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
                  <DialogTitle>{editingVoce ? 'Modifica Voce Analitica' : 'Nuova Voce Analitica'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                          control={form.control}
                          name="id"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>ID</FormLabel>
                                  <FormControl>
                                      <Input placeholder="ID Voce (es. COSTI_SOFTWARE)" {...field} disabled={!!editingVoce} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="nome"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Nome</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Nome descrittivo" {...field} />
                                  </FormControl>
                                  <FormMessage />
                              </FormItem>
                          )}
                      />
                      <FormField
                          control={form.control}
                          name="descrizione"
                          render={({ field }) => (
                              <FormItem>
                                  <FormLabel>Descrizione (opzionale)</FormLabel>
                                  <FormControl>
                                      <Input placeholder="Descrizione dettagliata" {...field} />
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
      
      <AlertDialog open={!!deletingVoce} onOpenChange={() => setDeletingVoce(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Vuoi davvero eliminare la voce "{deletingVoce?.nome}"? L'operazione fallirà se la voce è già stata utilizzata.
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

const ContiTable = ({ data, onDataChange, vociAnalitiche }: { data: Conto[], onDataChange: () => void, vociAnalitiche: VoceAnalitica[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConto, setEditingConto] = useState<Conto | null>(null);
  const [deletingConto, setDeletingConto] = useState<Conto | null>(null);

  const contoSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    codice: z.string().min(1, "Il codice è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    tipo: z.nativeEnum(TipoConto),
    richiedeVoceAnalitica: z.boolean().default(false),
    voceAnaliticaSuggeritaId: z.string().optional().nullable(),
    // Campi array non gestiti nel form per semplicità
  });

  const form = useForm<z.infer<typeof contoSchema>>({
    resolver: zodResolver(contoSchema),
    defaultValues: {
      id: "",
      codice: "",
      nome: "",
      tipo: TipoConto.Costo,
      richiedeVoceAnalitica: false,
      voceAnaliticaSuggeritaId: null,
    },
  });

  const handleOpenDialog = (conto: Conto | null = null) => {
    setEditingConto(conto);
    if (conto) {
      form.reset({
        ...conto,
        voceAnaliticaSuggeritaId: conto.voceAnaliticaSuggeritaId || null,
      });
    } else {
      form.reset({
        id: "",
        codice: "",
        nome: "",
        tipo: TipoConto.Costo,
        richiedeVoceAnalitica: false,
        voceAnaliticaSuggeritaId: null,
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof contoSchema>) => {
    try {
      if (editingConto) {
        await updateConto(editingConto.id, values);
        toast.success("Conto aggiornato con successo.");
      } else {
        await createConto(values as Conto);
        toast.success("Conto creato con successo.");
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingConto) return;
    try {
      await deleteConto(deletingConto.id);
      toast.success("Conto eliminato con successo.");
      onDataChange();
    } catch (error) {
      toast.error("Impossibile eliminare: il conto potrebbe essere in uso.");
    } finally {
      setDeletingConto(null);
    }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Piano dei Conti</CardTitle>
          <Button onClick={() => handleOpenDialog()}>Aggiungi Conto</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Codice</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Richiede Voce Analitica</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((conto) => (
                <TableRow key={conto.id}>
                  <TableCell><Badge variant="secondary">{conto.codice}</Badge></TableCell>
                  <TableCell>{conto.nome}</TableCell>
                  <TableCell>{conto.tipo}</TableCell>
                  <TableCell>{conto.richiedeVoceAnalitica ? 'Sì' : 'No'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(conto)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingConto(conto)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
              <DialogHeader>
                  <DialogTitle>{editingConto ? 'Modifica Conto' : 'Nuovo Conto'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="id" render={({ field }) => (
                          <FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} disabled={!!editingConto} /></FormControl><FormMessage /></FormItem>
                      )}/>
                      <FormField control={form.control} name="codice" render={({ field }) => (
                          <FormItem><FormLabel>Codice</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name="nome" render={({ field }) => (
                        <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField control={form.control} name="tipo" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo Conto</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                            <SelectContent>
                              {Object.values(TipoConto).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                      <FormField control={form.control} name="voceAnaliticaSuggeritaId" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Voce Analitica Suggerita</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value || ''}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Nessuna" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="">Nessuna</SelectItem>
                              {vociAnalitiche.map(voce => <SelectItem key={voce.id} value={voce.id}>{voce.nome}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}/>
                    </div>
                    <FormField control={form.control} name="richiedeVoceAnalitica" render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Richiede Voce Analitica</FormLabel>
                          </div>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )}/>
                    <DialogFooter>
                      <Button type="submit">Salva</Button>
                    </DialogFooter>
                  </form>
              </Form>
          </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!deletingConto} onOpenChange={() => setDeletingConto(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>Vuoi davvero eliminare il conto "{deletingConto?.nome}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
};

const CommesseTable = ({ data, onDataChange, clienti }: { data: Commessa[], onDataChange: () => void, clienti: Cliente[] }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCommessa, setEditingCommessa] = useState<Commessa | null>(null);
  const [deletingCommessa, setDeletingCommessa] = useState<Commessa | null>(null);

  const commessaSchema = z.object({
    id: z.string().min(1, "L'ID è obbligatorio."),
    nome: z.string().min(2, "Il nome è obbligatorio."),
    descrizione: z.string().optional(),
    clienteId: z.string().min(1, "È obbligatorio selezionare un cliente."),
  });

  const form = useForm<z.infer<typeof commessaSchema>>({
    resolver: zodResolver(commessaSchema),
    defaultValues: { id: "", nome: "", descrizione: "", clienteId: "" },
  });

  const handleOpenDialog = (commessa: Commessa | null = null) => {
    setEditingCommessa(commessa);
    if (commessa) {
      form.reset(commessa);
    } else {
      form.reset({ id: "", nome: "", descrizione: "", clienteId: "" });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: z.infer<typeof commessaSchema>) => {
    try {
      if (editingCommessa) {
        await updateCommessa(editingCommessa.id, values);
        toast.success("Commessa aggiornata con successo.");
      } else {
        await createCommessa({...values, budget: []});
        toast.success("Commessa creata con successo.");
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingCommessa) return;
    try {
      await deleteCommessa(deletingCommessa.id);
      toast.success("Commessa eliminata con successo.");
      onDataChange();
    } catch (error) {
      toast.error("Impossibile eliminare: la commessa potrebbe avere registrazioni associate.");
    } finally {
      setDeletingCommessa(null);
    }
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Commesse</CardTitle>
        <Button onClick={() => handleOpenDialog()}>Aggiungi Commessa</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Budget Totale</TableHead>
              <TableHead className="text-right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((commessa) => (
              <TableRow key={commessa.id}>
                <TableCell>{commessa.nome}</TableCell>
                <TableCell>{commessa.cliente?.nome || 'N/A'}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                    commessa.budget?.reduce((sum, voce) => sum + voce.importo, 0) || 0
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(commessa)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => setDeletingCommessa(commessa)}><Trash2 className="h-4 w-4" /></Button>
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
          <DialogTitle>{editingCommessa ? 'Modifica Commessa' : 'Nuova Commessa'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="id" render={({ field }) => (
                <FormItem><FormLabel>ID</FormLabel><FormControl><Input {...field} disabled={!!editingCommessa} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem><FormLabel>Nome</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="descrizione" render={({ field }) => (
                <FormItem><FormLabel>Descrizione</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="clienteId" render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Seleziona un cliente..." /></SelectTrigger></FormControl>
                  <SelectContent>
                    {clienti.map(cliente => <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>
            <DialogFooter>
              <Button type="submit">Salva</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
    
    <AlertDialog open={!!deletingCommessa} onOpenChange={() => setDeletingCommessa(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>Vuoi davvero eliminare la commessa "{deletingCommessa?.nome}"?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

const ScrittureTable = ({ data, onDataChange }: { data: ScritturaContabile[], onDataChange: () => void }) => {
  const navigate = useNavigate();
  const [deletingRegistrazione, setDeletingRegistrazione] = useState<ScritturaContabile | null>(null);

  const handleDelete = async () => {
    if (!deletingRegistrazione) return;
    try {
      await deleteRegistrazione(deletingRegistrazione.id);
      toast.success("Registrazione eliminata con successo.");
      onDataChange();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeletingRegistrazione(null);
    }
  };

  const handleEdit = (registrazione: ScritturaContabile) => {
    navigate(`/app/prima-nota/modifica/${registrazione.id}`);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Scritture Contabili</CardTitle>
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
              {data.map((scrittura) => (
                <TableRow key={scrittura.id}>
                  <TableCell>{new Date(scrittura.data).toLocaleDateString()}</TableCell>
                  <TableCell>{scrittura.descrizione}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{scrittura.causaleId}</Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(
                      scrittura.righe.reduce((acc, riga) => acc + riga.dare, 0)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(scrittura)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeletingRegistrazione(scrittura)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <AlertDialog open={!!deletingRegistrazione} onOpenChange={() => setDeletingRegistrazione(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione eliminerà la registrazione contabile e tutte le sue righe e allocazioni. Questa azione non può essere annullata.
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

const Database: React.FC = () => {
  const [data, setData] = useState<DatabaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<TableKey>('scritture');

  useEffect(() => {
    fetchDatabaseData();
  }, []);

  const fetchDatabaseData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/database');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Errore nel recupero dei dati del database:", error);
      toast.error("Impossibile caricare i dati dal database.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleDataChange = () => {
    fetchDatabaseData(false); // Ricarica i dati senza mostrare l'indicatore di caricamento principale
  };

  const renderSelectedTable = () => {
    if (!data) return <p>Dati non disponibili.</p>;

    switch (selectedTable) {
        case 'clienti':
            return <ClientiTable data={data.clienti} onDataChange={handleDataChange} />;
        case 'fornitori':
            return <FornitoriTable data={data.fornitori} onDataChange={handleDataChange} />;
        case 'vociAnalitiche':
            return <VociAnaliticheTable data={data.vociAnalitiche} onDataChange={handleDataChange} />;
        case 'conti':
            return <ContiTable data={data.conti} onDataChange={handleDataChange} vociAnalitiche={data.vociAnalitiche} />;
        case 'commesse':
            return <CommesseTable data={data.commesse} onDataChange={handleDataChange} clienti={data.clienti}/>;
        case 'scritture':
             return <ScrittureTable data={data.scritture} onDataChange={handleDataChange} />;
        default:
            return <p>Seleziona una tabella da visualizzare.</p>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <DatabaseIcon className="h-6 w-6 mr-2" />
          <h1 className="text-2xl font-bold">Amministrazione Database</h1>
        </div>
        <Button onClick={() => fetchDatabaseData()} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Aggiorna Dati
        </Button>
      </header>
      <main className="flex-grow p-4">
        <Tabs defaultValue="data-management">
          <TabsList className="mb-4">
            <TabsTrigger value="data-management">Gestione Dati</TabsTrigger>
            <TabsTrigger value="template-management">Gestione Template Import</TabsTrigger>
          </TabsList>
          <TabsContent value="data-management">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : (
              <ResizablePanelGroup direction="horizontal" className="rounded-lg border">
                <ResizablePanel defaultSize={20}>
                  <div className="flex h-full flex-col p-4 space-y-2">
                    <h2 className="text-lg font-semibold">Tabelle</h2>
                    {tableConfig.map((table) => (
                      <Button
                        key={table.key}
                        variant={selectedTable === table.key ? 'secondary' : 'ghost'}
                        onClick={() => setSelectedTable(table.key)}
                        className="w-full justify-start"
                      >
                        <table.icon className="mr-2 h-4 w-4" />
                        {table.label}
                        <Badge variant="outline" className="ml-auto">
                          {data?.stats[`totale${table.label.replace(/\s/g, '')}` as keyof typeof data.stats] ?? 0}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={80}>
                  <div className="p-4">
                    {renderSelectedTable()}
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            )}
          </TabsContent>
          <TabsContent value="template-management">
            <ImportTemplatesAdmin />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Database;
