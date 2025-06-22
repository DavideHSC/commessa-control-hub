import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileText, Users, FileBarChart2 } from 'lucide-react';

const ANAGRAFICA_TEMPLATES = [
    { value: 'causali', label: 'Anagrafica Causali Contabili' },
    { value: 'codici_iva', label: 'Anagrafica Codici IVA' },
    { value: 'condizioni_pagamento', label: 'Anagrafica Condizioni di Pagamento' },
    { value: 'anagrafica_clifor', label: 'Anagrafica Clienti/Fornitori' },
    { value: 'piano_dei_conti', label: 'Anagrafica Piano dei Conti' },
];

const ImportPage: React.FC = () => {
    // State per l'importazione delle anagrafiche
    const [anagraficaFiles, setAnagraficaFiles] = useState<FileList | null>(null);
    const [selectedAnagraficaTemplate, setSelectedAnagraficaTemplate] = useState<string>('');
    const [isAnagraficaProcessing, setIsAnagraficaProcessing] = useState(false);

    // State per l'importazione delle scritture
    const [scrittureFiles, setScrittureFiles] = useState<FileList | null>(null);
    const [isScrittureProcessing, setIsScrittureProcessing] = useState(false);
    
    const { toast } = useToast();

    const handleAnagraficaImport = async () => {
        if (!anagraficaFiles || anagraficaFiles.length === 0 || !selectedAnagraficaTemplate) return;

        setIsAnagraficaProcessing(true);
        const formData = new FormData();
        formData.append('file', anagraficaFiles[0]);

        try {
            const response = await fetch(`/api/import/anagrafica/${selectedAnagraficaTemplate}`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Errore durante l\'importazione.');
            toast({ title: 'Successo!', description: `Importazione anagrafica '${selectedAnagraficaTemplate}' completata.` });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Errore', description: (error as Error).message });
        } finally {
            setIsAnagraficaProcessing(false);
            setAnagraficaFiles(null);
            const fileInput = document.getElementById('anagrafica-file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
        }
    };

    const handleScrittureImport = async () => {
        if (!scrittureFiles || scrittureFiles.length === 0) return;
        
        setIsScrittureProcessing(true);
        const formData = new FormData();
        for (let i = 0; i < scrittureFiles.length; i++) {
            formData.append('files', scrittureFiles[i]);
        }
        
        try {
            const response = await fetch('/api/import/scritture', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Errore durante l\'importazione.');
            toast({ title: 'Successo!', description: 'Importazione scritture completata.' });
        } catch (error) {
            toast({ variant: 'destructive', title: 'Errore', description: (error as Error).message });
        } finally {
            setIsScrittureProcessing(false);
            setScrittureFiles(null);
            const fileInput = document.getElementById('scritture-file-upload') as HTMLInputElement;
            if(fileInput) fileInput.value = "";
        }
    };


    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Importazione Dati Guidata</h1>
                <p className="text-slate-600 mt-1">
                    Segui i passaggi per importare correttamente i dati dal tuo gestionale.
                </p>
            </div>

            <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                    Esegui sempre il **Passo 1** per importare o aggiornare le anagrafiche prima di procedere con le scritture contabili per evitare errori di dati mancanti.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-6 w-6 text-slate-500" />
                        Passo 1: Importa Anagrafiche
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
                        Passo 2: Importa Scritture Contabili
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
                            Seleziona tutti i file necessari in una volta (es. PNTESTA.TXT, PNRIGCON.TXT...).
                        </p>
                    </div>
                     <Button onClick={handleScrittureImport} disabled={isScrittureProcessing || !scrittureFiles}>
                        {isScrittureProcessing ? 'Importazione...' : 'Importa Scritture'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImportPage; 