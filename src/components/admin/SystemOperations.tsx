import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { resetDatabase, backupDatabase } from '@/api'; 
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export const SystemOperations = () => {
    const { toast } = useToast();
    const [isResetting, setIsResetting] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const handleReset = async () => {
        setIsResetting(true);
        try {
            const result = await resetDatabase();
            toast({
                title: 'Successo',
                description: result.message,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Impossibile resettare il database.";
            toast({
                title: 'Errore',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsResetting(false);
        }
    };

    const handleBackup = async () => {
        setIsBackingUp(true);
        try {
            const result = await backupDatabase();
            toast({
                title: 'Successo',
                description: `${result.message} Creato in: ${result.filePath}`,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Impossibile creare il backup del database.";
            toast({
                title: 'Errore',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsBackingUp(false);
        }
    };

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Operazioni di Sistema</CardTitle>
                <CardDescription>
                    Azioni pericolose che modificano lo stato del sistema in modo irreversibile. Usare con la massima cautela.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full" disabled={isResetting}>
                            {isResetting ? 'Reset in corso...' : 'Azzera e Ripopola Database'}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Questa azione è irreversibile. Tutti i dati verranno cancellati e il database verrà ripopolato
                                con i dati di seeding iniziali.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annulla</AlertDialogCancel>
                            <AlertDialogAction onClick={handleReset}>Continua</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <Button variant="outline" className="w-full" onClick={handleBackup} disabled={isBackingUp}>
                    {isBackingUp ? 'Backup in corso...' : 'Crea Backup Database'}
                </Button>
            </CardContent>
        </Card>
    );
}; 