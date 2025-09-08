import { useMemo } from 'react';
import { GenericForm } from './GenericForm';

interface CommessaFormProps {
  commessa?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  clientiOptions?: { label: string; value: string }[];
  commesseOptions?: { label: string; value: string }[]; // Add commesse for parent selection
  hideTitle?: boolean; // Add option to hide internal title/description
}

export const CommessaForm = ({
  commessa,
  onSubmit,
  onCancel,
  loading = false,
  clientiOptions = [],
  commesseOptions = [],
  hideTitle = false,
}: CommessaFormProps) => {
  const defaultValues = useMemo(() => ({ 
    stato: 'In Corso', 
    priorita: 'media', 
    isAttiva: true,
    dataInizio: new Date().toISOString().split('T')[0] // Data corrente in formato YYYY-MM-DD
  }), []);

  const fields = useMemo(() => [
    {
      name: 'nome',
      label: 'Nome Commessa',
      type: 'text' as const,
      required: true,
      placeholder: 'Es. Progetto Alpha 2025',
      validation: {
        minLength: 3,
        maxLength: 100,
        message: 'Il nome deve essere tra 3 e 100 caratteri',
      },
    },
    {
      name: 'descrizione',
      label: 'Descrizione',
      type: 'textarea' as const,
      placeholder: 'Descrizione dettagliata della commessa...',
      validation: {
        maxLength: 500,
        message: 'La descrizione non può superare 500 caratteri',
      },
    },
    {
      name: 'clienteId',
      label: 'Cliente',
      type: 'select' as const,
      required: true,
      options: clientiOptions,
      description: 'Seleziona il cliente associato alla commessa',
    },
    {
      name: 'parentId',
      label: 'Commessa Padre',
      type: 'select' as const,
      options: commesseOptions,
      description: 'Seleziona una commessa padre per creare una sub-commessa (opzionale)',
    },
    {
      name: 'dataInizio',
      label: 'Data Inizio',
      type: 'date' as const,
      required: true,
    },
    {
      name: 'dataFine',
      label: 'Data Fine',
      type: 'date' as const,
      description: 'Data prevista di completamento (opzionale)',
    },
    {
      name: 'budget',
      label: 'Budget Totale',
      type: 'currency' as const,
      placeholder: '0',
      validation: {
        min: 0,
        message: 'Il budget deve essere un valore positivo',
      },
      description: 'Budget totale previsto in euro',
    },
    {
      name: 'priorita',
      label: 'Priorità',
      type: 'select' as const,
      options: [
        { label: 'Bassa', value: 'bassa' },
        { label: 'Media', value: 'media' },
        { label: 'Alta', value: 'alta' },
        { label: 'Urgente', value: 'urgente' },
      ],
    },
    {
      name: 'stato',
      label: 'Stato',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'In Preparazione', value: 'In Preparazione' },
        { label: 'In Corso', value: 'In Corso' },
        { label: 'In Pausa', value: 'In Pausa' },
        { label: 'Completata', value: 'Completata' },
        { label: 'Annullata', value: 'Annullata' },
      ],
    },
    {
      name: 'isAttiva',
      label: 'Commessa Attiva',
      type: 'checkbox' as const,
      description: 'Le commesse attive possono ricevere allocazioni di costi',
    },
  ], [clientiOptions, commesseOptions]);

  const handleSubmit = (data: Record<string, unknown>) => {
    onSubmit(data);
  };

  // Merge corretto tra commessa esistente e valori di default
  const initialValues = useMemo(() => {
    if (!commessa) return defaultValues;
    
    // Merge: valori da commessa hanno priorità, ma i default riempiono i buchi
    return {
      ...defaultValues,
      ...commessa,
      // Gestione speciale per campi che potrebbero essere null/undefined
      stato: commessa.stato || defaultValues.stato,
      priorita: commessa.priorita || defaultValues.priorita,
      isAttiva: commessa.isAttiva !== undefined ? commessa.isAttiva : defaultValues.isAttiva,
      dataInizio: commessa.dataInizio || defaultValues.dataInizio,
    };
  }, [commessa, defaultValues]);

  return (
    <GenericForm
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialValues={initialValues}
      loading={loading}
      title={hideTitle ? undefined : (commessa ? 'Modifica Commessa' : 'Nuova Commessa')}
      description={hideTitle ? undefined : (commessa ? 'Aggiorna i dettagli della commessa' : 'Crea una nuova commessa')}
      submitText={commessa ? 'Aggiorna' : 'Crea Commessa'}
    />
  );
};