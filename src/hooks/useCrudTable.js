import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
export const useCrudTable = ({ schema, api, onDataChange, resourceName, defaultValues, getId, }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [deletingItem, setDeletingItem] = useState(null);
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues,
    });
    const handleOpenDialog = (item = null) => {
        setEditingItem(item);
        if (item) {
            form.reset(item); // Reset con i valori dell'item da modificare
        }
        else {
            form.reset(defaultValues); // Reset con valori di default per la creazione
        }
        setIsDialogOpen(true);
    };
    const onSubmit = async (values) => {
        try {
            if (editingItem) {
                await api.update(getId(editingItem), values);
                toast.success(`${resourceName} aggiornato con successo.`);
            }
            else {
                await api.create(values);
                toast.success(`${resourceName} creato con successo.`);
            }
            onDataChange();
            setIsDialogOpen(false);
        }
        catch (error) {
            toast.error(error.message);
        }
    };
    const handleDelete = async () => {
        if (!deletingItem)
            return;
        try {
            await api.delete(getId(deletingItem));
            toast.success(`${resourceName} eliminato con successo.`);
            onDataChange();
        }
        catch (error) {
            const defaultMessage = `Impossibile eliminare: ${resourceName.toLowerCase()} potrebbe essere in uso.`;
            const message = error instanceof Error ? error.message : defaultMessage;
            toast.error(message);
        }
        finally {
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
