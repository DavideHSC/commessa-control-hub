import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Users, FileBarChart2 } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from 'axios';

const ANAGRAFICA_TEMPLATES = [
    { value: 'piano-dei-conti', label: 'Anagrafica Piano dei Conti' },
    { value: 'codici-iva', label: 'Anagrafica Codici IVA' },
    { value: 'causali-contabili', label: 'Anagrafica Causali Contabili' },
    { value: 'condizioni-pagamento', label: 'Anagrafica Condizioni di Pagamento' },
    { value: 'clienti-fornitori', label: 'Anagrafica Clienti/Fornitori' },
];

type ImportResult = {
  success: boolean;
  jobId: string;
  stats: {
    filesProcessed: number;
    scrittureImportate: number;
    righeContabiliOrganizzate: number;
    righeIvaOrganizzate: number;
    allocazioniOrganizzate: number;
    erroriValidazione: number;
    contiCreati: { id: string, nome: string }[];
    fornitoriCreati: { id: string, nome: string }[];
    causaliCreate: { id: string, nome: string }[];
    codiciIvaCreati: { id: string, nome: string }[];
    vociAnaliticheCreate: { id: string, nome: string }[];
  };
  message: string;
} | null;

const ImportPage: React.FC = () => {
    // State per l'importazione delle anagrafiche
    const [anagraficaFiles, setAnagraficaFiles] = useState<FileList | null>(null);
    const [selectedAnagraficaTemplate, setSelectedAnagraficaTemplate] = useState<string>('');
    const [isAnagraficaProcessing, setIsAnagraficaProcessing] = useState(false);
    const [isPrimaNotaProcessing, setIsPrimaNotaProcessing] = useState(false);

    // State per l'importazione delle scritture
    const [scrittureFiles, setScrittureFiles] = useState<FileList | null>(null);
    const [isScrittureProcessing, setIsScrittureProcessing] = useState(false);

    const { toast } = useToast();

    const [importReport, setImportReport] = useState<ImportResult>(null);

    const handleAnagraficaImport = async () => {
        if (!anagraficaFiles || anagraficaFiles.length === 0 || !selectedAnagraficaTemplate) {
            toast({ title: 'Dati mancanti', description: 'Seleziona un tipo di anagrafica e un file.' });
            return;
        }
        setIsAnagraficaProcessing(true);

        // Costruisci l'URL corretto basandoti sul template selezionato
        const endpoint = `/api/v2/import/${selectedAnagraficaTemplate}`;

        const formData = new FormData();
        formData.append('file', anagraficaFiles[0]);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            const templateLabel = ANAGRAFICA_TEMPLATES.find(t => t.value === selectedAnagraficaTemplate)?.label || selectedAnagraficaTemplate;
            
            if (response.ok) {
                toast({
                    title: 'Successo!',
                    description: `Importazione '${templateLabel}' completata: ${result.createdRecords} creati, ${result.updatedRecords} aggiornati.`
                });
                console.log('Risultato importazione:', result);
            } else {
                toast({ variant: 'destructive', title: 'Errore Importazione', description: result.message || `Errore durante l'importazione di '${templateLabel}'. Dettagli in console.` });
                console.error(`Dettaglio errore importazione '${templateLabel}':`, result);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Errore di Rete', description: 'Impossibile comunicare con il server. Controlla la console.' });
            console.error("Errore di rete o di parsing:", error);
        } finally {
            setIsAnagraficaProcessing(false);
            setAnagraficaFiles(null);
            const fileInput = document.getElementById('anagrafica-file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
        }
    };

    const handleScrittureImport = async () => {
        if (!scrittureFiles || scrittureFiles.length === 0) {
            toast({
                title: 'Errore',
                description: 'Per favore, seleziona i file delle scritture da importare.',
                variant: 'destructive',
            });
            return;
        }

        setIsScrittureProcessing(true);
        setImportReport(null); // Reset report before new import
        const formData = new FormData();

        // Mappa i nomi dei file ai fieldname attesi dal backend
        const fileMap: { [key: string]: string } = {
            'PNTESTA.TXT': 'pntesta',
            'PNRIGCON.TXT': 'pnrigcon',
            'PNRIGIVA.TXT': 'pnrigiva',
            'MOVANAC.TXT': 'movanac',
        };

        let foundRequired = false;
        for (let i = 0; i < scrittureFiles.length; i++) {
            const file = scrittureFiles[i];
            const fieldName = fileMap[file.name.toUpperCase()];
            if (fieldName) {
                formData.append(fieldName, file);
                if (fieldName === 'pntesta' || fieldName === 'pnrigcon') {
                    foundRequired = true;
                }
            } else {
                console.warn(`File non riconosciuto '${file.name}', verrà ignorato.`);
            }
        }

        if (!foundRequired) {
            toast({
                title: 'Errore',
                description: 'Sono richiesti almeno i file PNTESTA.TXT e PNRIGCON.TXT.',
                variant: 'destructive',
            });
            setIsScrittureProcessing(false);
            return;
        }

        try {
            const response = await axios.post<NonNullable<ImportResult>>('/api/v2/import/scritture-contabili', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({
                title: 'Successo',
                description: response.data.message,
            });

            // Set the report data from the API response
            setImportReport(response.data);

            // Clear file input
            setScrittureFiles(null);
            const fileInput = document.getElementById('scritture-file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = "";

        } catch (error) {
            const errorMsg = axios.isAxiosError(error) && error.response ? error.response.data.message : 'Si è verificato un errore durante l\'importazione.';
            toast({
                title: 'Errore di Importazione',
                description: errorMsg,
                variant: 'destructive',
            });
            setImportReport(null);
        } finally {
            setIsScrittureProcessing(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Importazione Dati</h1>
                <p className="text-slate-600 mt-1">
                    Importare i dati dal gestionale.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-slate-500" />
                        Importa Anagrafiche
                    </CardTitle>
                    <CardDescription>
                        Importa le anagrafiche di base come clienti, fornitori, piano dei conti, etc.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="font-medium">1. Seleziona il tipo di anagrafica</label>
                        <Select onValueChange={setSelectedAnagraficaTemplate} value={selectedAnagraficaTemplate}>
                            <SelectTrigger>
                                <SelectValue placeholder="Scegli un tipo di anagrafica..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ANAGRAFICA_TEMPLATES.map(template => (
                                    <SelectItem key={template.value} value={template.value}>
                                        {template.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium">2. Carica il file</label>
                        <Input
                            id="anagrafica-file-upload"
                            type="file"
                            accept=".txt"
                            onChange={(e) => setAnagraficaFiles(e.target.files)}
                            disabled={isAnagraficaProcessing || !selectedAnagraficaTemplate}
                        />
                    </div>
                    <Button onClick={handleAnagraficaImport} disabled={isAnagraficaProcessing || !anagraficaFiles}>
                        {isAnagraficaProcessing ? 'Importazione...' : 'Importa Anagrafica'}
                    </Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileBarChart2 className="h-6 w-6 text-slate-500" />
                        Importa Scritture Contabili
                    </CardTitle>
                    <CardDescription>
                        Una volta caricate le anagrafiche, importa le scritture contabili. Questa operazione correla dati da più file.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="font-medium">Carica i file delle scritture</label>
                        <Input
                            id="scritture-file-upload"
                            type="file"
                            accept=".txt"
                            onChange={(e) => setScrittureFiles(e.target.files)}
                            disabled={isScrittureProcessing}
                            multiple
                        />
                        <p className="text-sm text-slate-500">
                            Seleziona tutti i file necessari in una volta (es. PNTESTA, PNRIGCON, MOVANAC e PNRIGIVA).
                        </p>
                    </div>
                    <Button onClick={handleScrittureImport} disabled={isScrittureProcessing || !scrittureFiles}>
                        {isScrittureProcessing ? 'Importazione...' : 'Importa Scritture'}
                    </Button>
                </CardContent>
            </Card>

            {/* Sezione Report di Importazione */}
            {importReport && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Report dell'Ultima Importazione</CardTitle>
                        <CardDescription className={importReport.success ? 'text-green-600' : 'text-red-600'}>
                            {importReport.success
                                ? `✅ ${importReport.message}`
                                : `❌ ${importReport.message}`
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="stats">
                                <AccordionTrigger>Statistiche Dettagliate</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        <li>File Processati: <strong>{importReport.stats.filesProcessed}</strong></li>
                                        <li>Scritture Importate: <strong>{importReport.stats.scrittureImportate}</strong></li>
                                        <li>Righe Contabili Elaborate: <strong>{importReport.stats.righeContabiliOrganizzate}</strong></li>
                                        <li>Righe IVA Elaborate: <strong>{importReport.stats.righeIvaOrganizzate}</strong></li>
                                        <li>Allocazioni Elaborate: <strong>{importReport.stats.allocazioniOrganizzate}</strong></li>
                                        <li className={importReport.stats.erroriValidazione > 0 ? 'text-red-500' : ''}>
                                            Errori di Validazione: <strong>{importReport.stats.erroriValidazione}</strong>
                                        </li>
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>

                            {importReport.stats.contiCreati?.length > 0 && (
                                <AccordionItem value="conti">
                                    <AccordionTrigger>Conti Segnaposto Creati ({importReport.stats.contiCreati.length})</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableCaption>Conti creati automaticamente perché non trovati nell'anagrafica.</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">ID/Codice</TableHead>
                                                    <TableHead>Nome</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importReport.stats.contiCreati.map(item => (
                                                    <TableRow key={`conto-${item.id}`}>
                                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                                        <TableCell>{item.nome}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {importReport.stats.fornitoriCreati?.length > 0 && (
                                <AccordionItem value="fornitori">
                                    <AccordionTrigger>Fornitori Segnaposto Creati ({importReport.stats.fornitoriCreati.length})</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableCaption>Fornitori creati automaticamente perché non trovati nell'anagrafica.</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">ID/Codice</TableHead>
                                                    <TableHead>Nome</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importReport.stats.fornitoriCreati.map(item => (
                                                    <TableRow key={`fornitore-${item.id}`}>
                                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                                        <TableCell>{item.nome}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                            {importReport.stats.causaliCreate?.length > 0 && (
                                <AccordionItem value="causali">
                                    <AccordionTrigger>Causali Contabili Create ({importReport.stats.causaliCreate.length})</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableCaption>Causali create automaticamente perché non trovate nell'anagrafica.</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[150px]">ID/Codice</TableHead>
                                                    <TableHead>Descrizione</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {importReport.stats.causaliCreate.map(item => (
                                                    <TableRow key={`causale-${item.id}`}>
                                                        <TableCell className="font-mono text-xs">{item.id}</TableCell>
                                                        <TableCell>{item.nome}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )}

                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ImportPage; 