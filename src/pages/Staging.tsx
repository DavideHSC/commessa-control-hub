import { StagingContiTable } from '@/components/database/StagingContiTable';
import { StagingScrittureTable } from '@/components/database/StagingScrittureTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/api';
import React, { useState } from 'react';

const StagingPage = () => {
  const { toast } = useToast();
  const [isFinalizing, setIsFinalizing] = useState(false);

  const handleFinalizeConti = async () => {
    setIsFinalizing(true);
    try {
      await apiClient.post('/reconciliation/finalize-conti');
      toast({
        title: "Successo!",
        description: "Il piano dei conti di staging è stato finalizzato e trasferito in produzione.",
        variant: "default",
      });
      // Potresti voler aggiungere qui una logica per ricaricare i dati o reindirizzare l'utente
    } catch (error) {
      toast({
        title: "Errore durante la finalizzazione",
        description: "Si è verificato un errore durante il trasferimento dei conti. Controlla la console per i dettagli.",
        variant: "destructive",
      });
      console.error("Errore finalizzazione conti:", error);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Visualizzatore Dati di Staging</h1>
      <p className="text-muted-foreground mb-6">
        In questa sezione puoi visualizzare i dati grezzi così come sono stati importati dai file di testo. 
        Questi dati non sono ancora stati validati o collegati al resto del database.
      </p>
      
      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Piano dei Conti in Staging</h2>
            <Button onClick={handleFinalizeConti} disabled={isFinalizing}>
              {isFinalizing ? 'Finalizzazione in corso...' : 'Finalizza e Sostituisci Piano dei Conti'}
            </Button>
          </div>
          <StagingContiTable />
        </div>
        <StagingScrittureTable />
      </div>
    </div>
  );
};

export default StagingPage; 