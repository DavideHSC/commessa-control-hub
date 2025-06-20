import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft } from 'lucide-react';

const IMPORT_TEMPLATES = [
    { value: 'causali', label: 'Anagrafica Causali Contabili' },
    { value: 'codici_iva', label: 'Anagrafica Codici IVA' },
    { value: 'condizioni_pagamento', label: 'Anagrafica Condizioni di Pagamento' },
    { value: 'clienti_fornitori', label: 'Anagrafica Clienti e Fornitori' },
    { value: 'scritture_contabili', label: 'Import Scritture Contabili (Multi-File)' },
];

type ImportStage = 'config' | 'preview' | 'importing';
interface PreviewData {
    summary: Record<string, number>;
    parsedData: any;
}

const ImportPage: React.FC = () => {
    const [files, setFiles] = useState<FileList | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [stage, setStage] = useState<ImportStage>('config');
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFiles(event.target.files);
        }
    };

    const handleAnalyze = async () => {
        if (!files || files.length === 0 || !selectedTemplate) return;

        setIsProcessing(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch(`/api/import/${selectedTemplate}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Errore durante l\'analisi.');

            if (selectedTemplate === 'scritture_contabili') {
                setPreviewData(result);
                setStage('preview');
            } else {
                // Per i template semplici, l'import è diretto
                toast({ title: 'Successo', description: result.message });
                resetState();
            }

        } catch (error) {
            toast({ variant: 'destructive', title: 'Errore', description: (error as Error).message });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleCommit = async () => {
        if (!previewData) return;

        setIsProcessing(true);
        try {
            const response = await fetch('/api/import/commit-scritture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ parsedData: previewData.parsedData }),
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Errore durante il salvataggio.');
            
            toast({ title: 'Successo!', description: result.message });
            resetState();

        } catch (error) {
            toast({ variant: 'destructive', title: 'Errore', description: (error as Error).message });
        } finally {
            setIsProcessing(false);
        }
    };

    const resetState = () => {
        setStage('config');
        setFiles(null);
        setPreviewData(null);
        setSelectedTemplate('');
        // Questo resetta anche il campo file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = "";
    };

    const isMultiFile = selectedTemplate === 'scritture_contabili';

    if (stage === 'preview' && previewData) {
        return (
            <div className="space-y-6">
                <Button variant="outline" onClick={resetState} className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla Configurazione
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Anteprima Importazione</CardTitle>
                        <CardDescription>
                            Controlla il riepilogo dei dati analizzati. Se tutto è corretto, conferma per salvare i dati nel database.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <h3 className="font-semibold">Riepilogo dei Record da Importare</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo Dato</TableHead>
                                    <TableHead className="text-right">Quantità</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {Object.entries(previewData.summary).map(([key, value]) => (
                                    <TableRow key={key}>
                                        <TableCell className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</TableCell>
                                        <TableCell className="text-right">{value}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" onClick={resetState} disabled={isProcessing}>Annulla</Button>
                            <Button onClick={handleCommit} disabled={isProcessing}>
                                {isProcessing ? 'Salvataggio in corso...' : 'Conferma e Salva'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Importazione Dati Dinamica</h1>
                <p className="text-slate-600 mt-1">
                    Seleziona un template e carica i file corrispondenti per importare i dati nel sistema.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configura Importazione</CardTitle>
                    <CardDescription>
                        I file devono essere in formato testo a larghezza fissa (.txt) e seguire la struttura attesa.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="template-select" className="font-medium">1. Seleziona il Template</label>
                        <Select onValueChange={setSelectedTemplate} value={selectedTemplate}>
                            <SelectTrigger id="template-select">
                                <SelectValue placeholder="Scegli un tipo di importazione..." />
                            </SelectTrigger>
                            <SelectContent>
                                {IMPORT_TEMPLATES.map(template => (
                                    <SelectItem key={template.value} value={template.value}>
                                        {template.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                         <label htmlFor="file-upload" className="font-medium">2. Carica i File</label>
                        <Input
                            id="file-upload"
                            type="file"
                            accept=".txt"
                            onChange={handleFileChange}
                            disabled={isProcessing || !selectedTemplate}
                            multiple={isMultiFile}
                        />
                        <p className="text-sm text-slate-500">
                            {isMultiFile 
                                ? "Puoi selezionare file multipli (es. PNTESTA.TXT, PNRIGCON.TXT...)." 
                                : "Seleziona un singolo file."}
                        </p>
                    </div>

                    <Button onClick={handleAnalyze} disabled={isProcessing || !files || !selectedTemplate}>
                        {isProcessing ? 'Analisi in corso...' : (isMultiFile ? 'Analizza File' : 'Importa Anagrafiche')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImportPage; 