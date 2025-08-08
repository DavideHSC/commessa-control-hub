import { useMemo } from 'react';
import { GenericForm } from './GenericForm';

interface VoceAnaliticaFormProps {
  voceAnalitica?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export const VoceAnaliticaForm = ({
  voceAnalitica,
  onSubmit,
  onCancel,
  loading = false,
}: VoceAnaliticaFormProps) => {
  const defaultValues = useMemo(() => ({
    tipo: 'costo',
    unitaMisura: 'euro',
    livelloGerarchico: 1,
    richiedeApprovazione: false,
    isAttiva: true,
  }), []);

  const fields = useMemo(() => [
    {
      name: 'nome',
      label: 'Nome Voce',
      type: 'text' as const,
      required: true,
      placeholder: 'Es. Personale, Materiali, Consulenze',
      validation: {
        minLength: 2,
        maxLength: 100,
        message: 'Il nome deve essere tra 2 e 100 caratteri',
      },
    },
    {
      name: 'descrizione',
      label: 'Descrizione',
      type: 'textarea' as const,
      placeholder: 'Descrizione dettagliata della voce analitica...',
      validation: {
        maxLength: 500,
        message: 'La descrizione non può superare 500 caratteri',
      },
    },
    {
      name: 'tipo',
      label: 'Tipo',
      type: 'select' as const,
      required: true,
      options: [
        { label: 'Costo', value: 'costo' },
        { label: 'Ricavo', value: 'ricavo' },
        { label: 'Investimento', value: 'investimento' },
        { label: 'Ammortamento', value: 'ammortamento' },
      ],
      description: 'Categoria contabile della voce analitica',
    },
    {
      name: 'codice',
      label: 'Codice',
      type: 'text' as const,
      placeholder: 'Es. PERS, MAT, CONS',
      validation: {
        minLength: 2,
        maxLength: 10,
        pattern: /^[A-Z0-9_]+$/,
        message: 'Il codice può contenere solo lettere maiuscole, numeri e underscore',
      },
      description: 'Codice univoco per identificare la voce (solo maiuscole, numeri, _)',
    },
    {
      name: 'unitaMisura',
      label: 'Unità di Misura',
      type: 'select' as const,
      options: [
        { label: 'Euro (€)', value: 'euro' },
        { label: 'Ore', value: 'ore' },
        { label: 'Giorni', value: 'giorni' },
        { label: 'Pezzi', value: 'pezzi' },
        { label: 'Chilogrammi', value: 'kg' },
        { label: 'Metri', value: 'm' },
        { label: 'Altro', value: 'altro' },
      ],
      description: 'Unità di misura per la quantificazione',
    },
    {
      name: 'costoUnitarioStandard',
      label: 'Costo Unitario Standard',
      type: 'number' as const,
      placeholder: '0.00',
      validation: {
        min: 0,
        message: 'Il costo deve essere positivo',
      },
      description: 'Costo standard per unità di misura (opzionale)',
    },
    {
      name: 'livelloGerarchico',
      label: 'Livello Gerarchico',
      type: 'number' as const,
      placeholder: '1',
      validation: {
        min: 1,
        max: 10,
        message: 'Il livello deve essere tra 1 e 10',
      },
      description: 'Livello nella gerarchia delle voci analitiche (1 = radice)',
    },
    {
      name: 'richiedeApprovazione',
      label: 'Richiede Approvazione',
      type: 'checkbox' as const,
      description: 'Le allocazioni su questa voce richiedono approvazione manuale',
    },
    {
      name: 'isAttiva',
      label: 'Voce Attiva',
      type: 'checkbox' as const,
      description: 'Solo le voci attive possono ricevere nuove allocazioni',
    },
  ], []);

  const initialValues = voceAnalitica || defaultValues;

  return (
    <GenericForm
      fields={fields}
      onSubmit={onSubmit}
      onCancel={onCancel}
      initialValues={initialValues}
      loading={loading}
      title={voceAnalitica ? 'Modifica Voce Analitica' : 'Nuova Voce Analitica'}
      description={
        voceAnalitica
          ? 'Aggiorna i dettagli della voce analitica'
          : 'Crea una nuova voce per la classificazione dei costi/ricavi'
      }
      submitText={voceAnalitica ? 'Aggiorna Voce' : 'Crea Voce'}
    />
  );
};