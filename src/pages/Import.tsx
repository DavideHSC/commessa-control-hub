import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ImportPage: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast({
                variant: 'destructive',
                title: 'Errore',
                description: 'Nessun file selezionato.',
            });
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/import', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Errore durante l\'importazione.');
            }

            toast({
                title: 'Successo',
                description: `${result.message}. Scritture create: ${result.summary.scrittureCreate}, Righe create: ${result.summary.righeCreate}`,
            });

        } catch (error) {
            const errorMessage = (error instanceof Error) ? error.message : 'Errore sconosciuto';
            toast({
                variant: 'destructive',
                title: 'Errore di importazione',
                description: errorMessage,
            });
            console.error('Errore di importazione:', error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Importazione Dati</h1>
                <p className="text-slate-600 mt-1">
                    Carica un file CSV per importare le scritture contabili.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Carica File CSV</CardTitle>
                    <CardDescription>
                        Il file deve rispettare il formato del template. Puoi scaricare il{' '}
                        <a href="/import-template.csv" download className="text-primary underline">
                            template di esempio qui
                        </a>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />
                    <Button onClick={handleUpload} disabled={isUploading || !file}>
                        {isUploading ? 'Importazione in corso...' : 'Importa Dati'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ImportPage; 