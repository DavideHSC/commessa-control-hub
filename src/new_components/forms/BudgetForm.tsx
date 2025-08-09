import { useMemo } from 'react';
import { GenericForm } from './GenericForm';

interface BudgetFormProps {
  budget?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  vociAnalitiche?: { label: string; value: string }[];
  commessaId?: string;
}

export const BudgetForm = ({
  budget,
  onSubmit,
  onCancel,
  loading = false,
  vociAnalitiche = [],
  commessaId,
}: BudgetFormProps) => {
  const defaultValues = useMemo(() => ({
    alertSoglia: 80,
    isAttivo: true,
    dataValiditaInizio: new Date().toISOString().split('T')[0],
  }), []);

  const fields = useMemo(() => [
    {
      name: 'voceAnaliticaId',
      label: 'Voce Analitica',
      type: 'select' as const,
      required: true,
      options: vociAnalitiche,
      description: 'Seleziona la categoria di budget da configurare',
    },
    {
      name: 'importoBudget',
      label: 'Importo Budget',
      type: 'number' as const,
      required: true,
      placeholder: '0.00',
      validation: {
        min: 0,
        message: 'L\'importo deve essere positivo',
      },
      description: 'Importo previsto in euro per questa voce',
    },
    {
      name: 'note',
      label: 'Note',
      type: 'textarea' as const,
      placeholder: 'Note aggiuntive sul budget...',
      validation: {
        maxLength: 300,
        message: 'Le note non possono superare 300 caratteri',
      },
    },
    {
      name: 'dataValiditaInizio',
      label: 'Validità Da',
      type: 'date' as const,
      description: 'Data di inizio validità del budget',
    },
    {
      name: 'dataValiditaFine',
      label: 'Validità Fino',
      type: 'date' as const,
      description: 'Data di fine validità del budget (opzionale)',
    },
    {
      name: 'alertSoglia',
      label: 'Soglia Allerta (%)',
      type: 'number' as const,
      placeholder: '80',
      validation: {
        min: 0,
        max: 100,
        message: 'La soglia deve essere tra 0 e 100%',
      },
      description: 'Percentuale di consumo budget che attiva gli alert',
    },
    {
      name: 'isAttivo',
      label: 'Budget Attivo',
      type: 'checkbox' as const,
      description: 'I budget attivi vengono monitorati per le allocazioni',
    },
  ], [vociAnalitiche]);

  const initialValues = budget || { ...defaultValues, commessaId };

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialValues={initialValues}
      loading={loading}
      title={budget ? 'Modifica Budget' : 'Nuovo Budget'}
      description={budget ? 'Aggiorna il budget per la voce analitica' : 'Configura un nuovo budget per la commessa'}
      submitText={budget ? 'Aggiorna Budget' : 'Crea Budget'}
    />
  );
};