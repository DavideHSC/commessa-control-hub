'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRegoleRipartizione,
  createRegolaRipartizione,
  updateRegolaRipartizione,
  deleteRegolaRipartizione,
  RegolaRipartizioneInput,
} from '@/api/regoleRipartizione';
import { getContiPerSelezione } from '@/api/conti';
import { getCommesseForSelect } from '@/api/commesse';
import { getVociAnalitichePerSelezione } from '@/api/vociAnalitiche';

import { RegolaRipartizione, Conto, Commessa, VoceAnalitica } from '@/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { columns } from './regole-ripartizione-columns';
import { RegolaRipartizioneForm } from './RegolaRipartizioneForm';

// Definiamo tipi più snelli per le selezioni
type SelectItem = { id: string; nome: string | undefined; };
type ContoSelectItem = { id: string; codice: string | undefined | null; nome: string; };


const RegoleRipartizioneManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<RegolaRipartizione | null>(null);

  // Queries
  const { data: regole, isLoading: isLoadingRegole } = useQuery<RegolaRipartizione[], Error>({
    queryKey: ['regoleRipartizione'],
    queryFn: getRegoleRipartizione,
  });

  const { data: conti } = useQuery<ContoSelectItem[], Error>({ 
    queryKey: ['contiForSelect'], 
    queryFn: getContiPerSelezione 
  });
  
  const { data: commesse } = useQuery<SelectItem[], Error>({ 
    queryKey: ['commesseForSelect'], 
    queryFn: getCommesseForSelect
  });

  const { data: vociAnalitiche } = useQuery<SelectItem[], Error>({ 
    queryKey: ['vociAnaliticheForSelect'], 
    queryFn: getVociAnalitichePerSelezione 
  });

  // Mutations
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regoleRipartizione'] });
      setIsFormOpen(false);
      setSelectedRule(null);
    },
  };

  const createMutation = useMutation({
    mutationFn: createRegolaRipartizione,
    ...mutationOptions,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RegolaRipartizioneInput> }) =>
      updateRegolaRipartizione(id, data),
    ...mutationOptions,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegolaRipartizione,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regoleRipartizione'] });
    },
  });

  const handleAddNew = useCallback(() => {
    setSelectedRule(null);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((rule: RegolaRipartizione) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questa regola?')) {
      deleteMutation.mutate(id);
    }
  }, [deleteMutation]);

  const handleSubmit = (data: RegolaRipartizioneInput) => {
    if (selectedRule) {
      // Quando si aggiorna, inviamo solo i dati del form
      const dataToUpdate: Partial<RegolaRipartizioneInput> = {
        ...data
      };
      updateMutation.mutate({ id: selectedRule.id, data: dataToUpdate });
    } else {
      createMutation.mutate(data);
    }
  };
  
  const memoizedColumns = useMemo(() => columns({ onEdit: handleEdit, onDelete: handleDelete }), [handleEdit, handleDelete]);

  // Gestiamo i dati per il form, assicurandoci che non siano mai undefined
  const contiPerForm = conti?.map(c => ({...c, nome: `${c.codice} - ${c.nome}`})) || [];
  const commessePerForm = commesse || [];
  const vociAnalitichePerForm = vociAnalitiche || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestione Regole di Ripartizione</CardTitle>
        <Button onClick={handleAddNew}>Aggiungi Nuova Regola</Button>
      </CardHeader>
      <CardContent>
        {isLoadingRegole ? (
          <p>Caricamento...</p>
        ) : (
          <DataTable columns={memoizedColumns} data={regole || []} />
        )}
        
        {isFormOpen && (
          <RegolaRipartizioneForm
            isOpen={isFormOpen}
            onClose={() => setIsFormOpen(false)}
            onSubmit={handleSubmit}
            initialData={selectedRule}
            conti={contiPerForm}
            commesse={commessePerForm}
            vociAnalitiche={vociAnalitichePerForm}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RegoleRipartizioneManager; 