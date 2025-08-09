import { useMemo } from 'react';
import { GenericForm } from './GenericForm';

interface CommessaFormProps {
  commessa?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  clientiOptions?: { label: string; value: string }[];
  hideTitle?: boolean; // Add option to hide internal title/description
}

export const CommessaForm = ({
  commessa,
  onSubmit,
  onCancel,
  loading = false,
  clientiOptions = [],
  hideTitle = false,
}: CommessaFormProps) => {
  const defaultValues = useMemo(() => ({ 
    stato: 'In Preparazione', 
    priorita: 'media', 
    isAttiva: true 
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
      type: 'number' as const,
      placeholder: '0.00',
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
  ], [clientiOptions]);

  const handleSubmit = (data: Record<string, unknown>) => {
    onSubmit(data);
  };

  return (
    <GenericForm
      fields={fields}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      initialValues={commessa || defaultValues}
      loading={loading}
      title={hideTitle ? undefined : (commessa ? 'Modifica Commessa' : 'Nuova Commessa')}
      description={hideTitle ? undefined : (commessa ? 'Aggiorna i dettagli della commessa' : 'Crea una nuova commessa')}
      submitText={commessa ? 'Aggiorna' : 'Crea Commessa'}
    />
  );
};