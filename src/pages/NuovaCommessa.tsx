import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import axios from "axios";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox } from "@/components/ui/combobox";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface SystemStatus {
    needsInitialization: boolean;
    checks: {
        clienti: {
            count: number;
            status: 'ok' | 'missing';
        };
        vociAnalitiche?: {
            count: number;
            status: 'ok' | 'missing';
        };
        // Aggiungere altri check se necessario
    };
}

const formSchema = z.object({
    id: z.string().min(1, "Il codice commessa è obbligatorio."),
    nome: z.string().min(1, "Il nome è obbligatorio."),
    descrizione: z.string().optional(),
    clienteId: z.string().min(1, "È necessario selezionare un cliente."),
    budget: z.array(z.object({
        voceAnaliticaId: z.string().min(1, "Seleziona una voce analitica."),
        importo: z.coerce.number().min(0.01, "L'importo deve essere positivo."),
    })).min(1, "È necessario inserire almeno una voce di budget.")
});

const NuovaCommessaForm = () => {
    const navigate = useNavigate();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: "",
            nome: "",
            descrizione: "",
            clienteId: "",
            budget: [{ voceAnaliticaId: "", importo: 0 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "budget",
    });

    const { data: clienti, isLoading: isLoadingClienti } = useQuery({
        queryKey: ['clienti'],
        queryFn: () => axios.get('/api/clienti').then(res => res.data.data),
    });

    const { data: vociAnalitiche, isLoading: isLoadingVoci } = useQuery({
        queryKey: ['vociAnalitiche'],
        queryFn: () => axios.get('/api/voci-analitiche').then(res => res.data.data),
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            await axios.post('/api/commesse', values);
            toast.success("Commessa creata con successo!");
            navigate('/commesse');
        } catch (error) {
            console.error(error);
            toast.error("Errore nella creazione della commessa.", {
                description: "Controlla la console per maggiori dettagli.",
            });
        }
    };

    const clientiOptions = clienti?.map((c: any) => ({ value: c.id, label: c.nome })) || [];
    const vociAnaliticheOptions = vociAnalitiche?.map((v: any) => ({ value: v.id, label: `${v.id} - ${v.nome}` })) || [];

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Codice Commessa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Es. COM-2024-001" {...field} />
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
                                    <FormLabel>Nome Commessa</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nome descrittivo della commessa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="clienteId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Cliente</FormLabel>
                                    <Combobox
                                        options={clientiOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Seleziona un cliente..."
                                        searchPlaceholder="Cerca cliente..."
                                        emptyPlaceholder="Nessun cliente trovato."
                                        disabled={isLoadingClienti}
                                    />
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
                                        <Textarea placeholder="Ulteriori dettagli sulla commessa" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Budget della Commessa</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-2/3">Voce Analitica</TableHead>
                                    <TableHead>Importo</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`budget.${index}.voceAnaliticaId`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                         <Combobox
                                                            options={vociAnaliticheOptions}
                                                            value={field.value}
                                                            onChange={field.onChange}
                                                            placeholder="Seleziona voce..."
                                                            searchPlaceholder="Cerca voce..."
                                                            emptyPlaceholder="Nessuna voce trovata."
                                                            disabled={isLoadingVoci}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`budget.${index}.importo`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" step="0.01" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {fields.length > 1 && (
                                                <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="mt-4">
                            <Button type="button" variant="outline" onClick={() => append({ voceAnaliticaId: '', importo: 0 })}>
                                Aggiungi Voce di Budget
                            </Button>
                        </div>
                         {form.formState.errors.budget?.root && (
                            <p className="text-sm font-medium text-destructive mt-2">{form.formState.errors.budget.root.message}</p>
                        )}
                    </CardContent>
                </Card>

                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Creazione in corso..." : "Crea Commessa"}
                </Button>
            </form>
        </Form>
    );
};

const NuovaCommessaPage = () => {
    const [status, setStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSystemStatus = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get<SystemStatus>('/api/system/status');
                setStatus(response.data);
            } catch (err) {
                setError("Impossibile verificare lo stato del sistema. Si prega di riprovare più tardi.");
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        checkSystemStatus();
    }, []);

    if (isLoading) {
        return (
            <div className="p-8 space-y-4">
                <Skeleton className="h-12 w-1/4" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return <Alert variant="destructive">
            <AlertTitle>Errore</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>;
    }

    if (status?.needsInitialization) {
        const missingItems = Object.entries(status.checks)
            .filter(([, check]) => check.status === 'missing')
            .map(([key]) => {
                // Mappatura per nomi più leggibili e consistenti
                switch (key) {
                    case 'clienti': return 'Clienti';
                    case 'vociAnalitiche': return 'Voci Analitiche';
                    case 'conti': return 'Conti';
                    case 'fornitori': return 'Fornitori';
                    case 'causali': return 'Causali';
                    default: return key;
                }
            });

        return (
            <div className="p-8">
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Azione Richiesta: Prerequisiti Mancanti</AlertTitle>
                    <AlertDescription className="mt-2">
                        Per creare una commessa è necessario aver importato almeno: <strong>{missingItems.join(', ')}</strong>.
                    </AlertDescription>
                    <div className="mt-4">
                        <Button asChild>
                            <Link to="/import">Vai alla Pagina di Importazione</Link>
                        </Button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8">
            <Card>
                <CardHeader>
                    <CardTitle>Crea una Nuova Commessa</CardTitle>
                </CardHeader>
                <CardContent>
                    <NuovaCommessaForm />
                </CardContent>
            </Card>
        </div>
    );
};

export default NuovaCommessaPage; 