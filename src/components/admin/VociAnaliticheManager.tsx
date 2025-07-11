import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VoceAnalitica } from '@prisma/client';
import {
  getVociAnalitiche,
  createVoceAnalitica,
  updateVoceAnalitica,
  deleteVoceAnalitica,
} from '@/api/vociAnalitiche';
import { VociAnaliticheTable } from './VociAnaliticheTable';
import { VoceAnaliticaForm } from './VoceAnaliticaForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const VociAnaliticheManager = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedVoce, setSelectedVoce] = useState<VoceAnalitica | null>(null);
  const [voceToDelete, setVoceToDelete] = useState<string | null>(null);

  const { data: voci = [], isLoading } = useQuery<VoceAnalitica[], Error>({
    queryKey: ['vociAnalitiche'],
    queryFn: () => getVociAnalitiche({ limit: 9999 }).then(res => res.data),
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vociAnalitiche'] });
      setIsFormOpen(false);
      setSelectedVoce(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  };

  const createMutation = useMutation({
    mutationFn: createVoceAnalitica,
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoceAnalitica> }) => updateVoceAnalitica(id, data),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVoceAnalitica,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vociAnalitiche'] });
      setVoceToDelete(null);
      toast({ title: 'Successo', description: 'Voce analitica eliminata.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
      setVoceToDelete(null);
    },
  });

  const handleAddNew = useCallback(() => {
    setSelectedVoce(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((voce: VoceAnalitica) => {
    setSelectedVoce(voce);
    setIsFormOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (voceToDelete) {
      deleteMutation.mutate(voceToDelete);
    }
  };

  const handleSubmit = (data: Partial<VoceAnalitica>) => {
    if (selectedVoce?.id) {
      updateMutation.mutate({ id: selectedVoce.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Voci Analitiche</CardTitle>
        <Button onClick={handleAddNew}>Aggiungi Nuova</Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Caricamento...</p>
        ) : (
          <VociAnaliticheTable 
            data={voci} 
            onEdit={handleEdit} 
            onDelete={(id) => setVoceToDelete(id)} 
          />
        )}
      </CardContent>

      <VoceAnaliticaForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedVoce}
      />

      <AlertDialog open={!!voceToDelete} onOpenChange={() => setVoceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione non può essere annullata. Questo eliminerà permanentemente la voce analitica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default VociAnaliticheManager; 