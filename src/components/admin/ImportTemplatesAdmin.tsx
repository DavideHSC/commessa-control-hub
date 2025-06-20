"use client";

import React, { useState, useEffect } from 'react';
import { ImportTemplate } from '@/types';
import { getImportTemplates, deleteImportTemplate } from '@/api/importTemplates';
import { getColumns } from './import-templates-columns';
import { DataTable } from '@/components/ui/data-table'; // Assuming a generic DataTable component exists
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// We will create this component next
import { TemplateFormDialog } from './TemplateFormDialog'; 

const ImportTemplatesAdmin: React.FC = () => {
    const [templates, setTemplates] = useState<ImportTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ImportTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<ImportTemplate | null>(null);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const data = await getImportTemplates();
            setTemplates(data);
            setError(null);
        } catch (err) {
            setError('Impossibile caricare i template.');
            toast.error((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleEdit = (template: ImportTemplate) => {
        setEditingTemplate(template);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTemplate) return;
        try {
            await deleteImportTemplate(deletingTemplate.id);
            toast.success(`Template "${deletingTemplate.nome}" eliminato con successo.`);
            fetchTemplates(); // Refresh data
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setDeletingTemplate(null);
        }
    };
    
    const handleFormClose = (refresh: boolean) => {
        setIsFormOpen(false);
        setEditingTemplate(null);
        if (refresh) {
            fetchTemplates();
        }
    }

    const columns = getColumns(handleEdit, (template) => setDeletingTemplate(template));

    if (loading) {
        return <div>Caricamento in corso...</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Aggiungi Template
                </Button>
            </div>
            
            <DataTable columns={columns} data={templates} />

            {/* Placeholder for the Form Dialog */}
            
            <TemplateFormDialog
                isOpen={isFormOpen}
                onClose={handleFormClose}
                template={editingTemplate}
            /> 
            
            <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vuoi davvero eliminare il template "<b>{deletingTemplate?.nome}</b>"? 
                            Questa azione non può essere annullata.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Elimina</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ImportTemplatesAdmin; 