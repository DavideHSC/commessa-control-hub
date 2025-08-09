import { useState } from 'react';
import { useForm, FieldValues, DeepPartial, DefaultValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// T è il tipo di dato (es. Cliente), TForm è il tipo del form (inferito dallo schema)
interface ApiFunctions<T, TForm> {
  create: (data: TForm) => Promise<T>;
  update: (id: string, data: TForm) => Promise<T>;
  delete: (id: string) => Promise<void>;
}

interface UseCrudTableOptions<T, TForm extends FieldValues> {
  schema: z.Schema<TForm>;
  api: ApiFunctions<T, TForm>;
  onDataChange: () => void;
  resourceName: string;
  defaultValues: DefaultValues<TForm>;
  getId: (item: T) => string;
}

export const useCrudTable = <T, TForm extends FieldValues>({
  schema,
  api,
  onDataChange,
  resourceName,
  defaultValues,
  getId,
}: UseCrudTableOptions<T, TForm>) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const form = useForm<TForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleOpenDialog = (item: T | null = null) => {
    setEditingItem(item);
    if (item) {
      form.reset(item as DefaultValues<TForm>); // Reset con i valori dell'item da modificare
    } else {
      form.reset(defaultValues); // Reset con valori di default per la creazione
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (values: TForm) => {
    try {
      if (editingItem) {
        await api.update(getId(editingItem), values);
        toast.success(`${resourceName} aggiornato con successo.`);
      } else {
        await api.create(values);
        toast.success(`${resourceName} creato con successo.`);
      }
      onDataChange();
      setIsDialogOpen(false);
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      await api.delete(getId(deletingItem));
      toast.success(`${resourceName} eliminato con successo.`);
      onDataChange();
    } catch (error) {
        const defaultMessage = `Impossibile eliminare: ${resourceName.toLowerCase()} potrebbe essere in uso.`;
        const message = error instanceof Error ? error.message : defaultMessage;
        toast.error(message);
    } finally {
      setDeletingItem(null);
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    editingItem,
    deletingItem,
    setDeletingItem,
    form,
    handleOpenDialog,
    onSubmit,
    handleDelete,
  };
}; 