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

  const mutation = useMutation({
    mutationFn: api.resetDatabase,
    onSuccess: () => {
      toast({
        title: "Successo",
        description: "Il database è stato azzerato con successo.",
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

  const handleResetDatabase = () => {
    mutation.mutate();
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={mutation.isPending}>
                {mutation.isPending ? "Azzeramento in corso..." : "Azzera Dati Database"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sei assolutamente sicuro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Questa azione è irreversibile. Tutti i dati inseriti, incluse
                  commesse, registrazioni, anagrafiche e template di
                  importazione verranno eliminati in modo permanente. Lo schema
                  del database e la sua struttura verranno preservati.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annulla</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleResetDatabase}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Sì, azzera il database
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpostazioniPage; 