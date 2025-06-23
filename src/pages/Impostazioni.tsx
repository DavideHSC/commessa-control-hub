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
                {mutation.isPending ? "Azzeramento e ripopolamento in corso..." : "Azzera e Ripopola Database"}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ImpostazioniPage; 