import { SystemOperations } from "@/components/admin/SystemOperations";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { resetDatabase, backupDatabase } from "@/api";
import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const Impostazioni = () => {
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleResetDatabase = async () => {
    setIsResetting(true);
    try {
      const result = await resetDatabase();
      toast({
        title: "Successo",
        description: result.message,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile resettare il database.";
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleBackupDatabase = async () => {
    setIsBackingUp(true);
    try {
      const result = await backupDatabase();
      toast({
        title: "Successo",
        description: `${result.message} Creato in: ${result.filePath}`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossibile creare il backup.";
      toast({
        title: "Errore",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between p-4 border-b">
        <div className='flex items-center'>
          <h1 className="text-2xl font-bold">Operazioni di Sistema</h1>
        </div>
      </header>
      <main className="flex-grow p-4 overflow-auto space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Azioni sul Database</CardTitle>
          <CardDescription>
            Azioni critiche che influenzano l'intero stato del database. Usare con cautela.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex space-x-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isResetting}>
                {isResetting ? "Reset in corso..." : "Azzera e Ripopola Database"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione è irreversibile. Il database verrà completamente cancellato e ripopolato 
                  con i dati iniziali definiti nello script di seed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetDatabase}>
                  Sì, procedi con il reset
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button onClick={handleBackupDatabase} disabled={isBackingUp}>
            {isBackingUp ? "Backup in corso..." : "Crea Backup Database"}
          </Button>
        </CardContent>
      </Card>
      </main>
    </div>
  );
};

export default Impostazioni; 