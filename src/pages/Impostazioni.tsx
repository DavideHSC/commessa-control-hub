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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import * as api from "@/api";
import { useMutation } from "@tanstack/react-query";

const ImpostazioniPage = () => {
  const { toast } = useToast();

  const resetMutation = useMutation({
    mutationFn: api.resetDatabase,
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Il database è stato azzerato e ripopolato con i dati di base.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Impossibile azzerare il database: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const backupMutation = useMutation({
    mutationFn: api.backupDatabase,
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Il backup del database è stato creato con successo.",
      });
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: `Impossibile creare il backup del database: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleResetDatabase = () => {
    resetMutation.mutate();
  };

  const handleBackupDatabase = () => {
    backupMutation.mutate();
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Impostazioni</h1>
      <Card>
        <CardHeader>
          <CardTitle>Operazioni di Sistema</CardTitle>
          <CardDescription>
            Azioni pericolose che modificano lo stato del sistema in modo
            irreversibile. Usare con la massima cautela.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={resetMutation.isPending}>
                  {resetMutation.isPending ? "Azzeramento e ripopolamento in corso..." : "Azzera e Ripopola Database"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione azzererà tutti i dati inseriti (commesse,
                    registrazioni, anagrafiche) ma ripopolerà automaticamente
                    il database con i dati di base necessari per l'utilizzo
                    dell'applicazione. I template di importazione verranno preservati.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetDatabase}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Sì, azzera e ripopola il database
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={backupMutation.isPending}>
                  {backupMutation.isPending ? "Creazione backup in corso..." : "Crea Backup Database"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Conferma creazione backup</AlertDialogTitle>
                  <AlertDialogDescription>
                    Questa azione creerà un backup completo del database corrente.
                    Il file di backup verrà salvato nella directory 'backups' del server.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annulla</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBackupDatabase}
                  >
                    Sì, crea backup
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpostazioniPage; 