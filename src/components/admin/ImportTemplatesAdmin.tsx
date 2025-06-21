"use client";

import React, { useState } from 'react';
import { ImportTemplate } from '@/types';
import { deleteImportTemplate } from '@/api/importTemplates';
import { getColumns } from './import-templates-columns';
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
import { TemplateFormDialog } from './TemplateFormDialog'; 
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';

const ImportTemplatesAdmin: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<ImportTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<ImportTemplate | null>(null);

    const {
      data: templates,
      totalCount,
      page,
      pageSize,
      search,
      sorting,
      loading,
      onPageChange,
      onPageSizeChange,
      onSearchChange,
      onSortingChange,
      fetchData: refreshData,
    } = useAdvancedTable<ImportTemplate>({
      endpoint: '/api/import-templates',
      initialSorting: [{ id: 'nome', desc: false }]
    });

    const handleEdit = (template: ImportTemplate) => {
        setEditingTemplate(template);
        setIsFormOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTemplate) return;
        try {
            await deleteImportTemplate(deletingTemplate.id);
            toast.success(`Template "${deletingTemplate.nome}" eliminato con successo.`);
            refreshData();
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
            refreshData();
        }
    }

    const columns = getColumns(handleEdit, (template) => setDeletingTemplate(template));

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => { setEditingTemplate(null); setIsFormOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Aggiungi Template
                </Button>
            </div>
            
            <AdvancedDataTable
              columns={columns}
              data={templates}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              searchValue={search}
              onSearchChange={onSearchChange}
              sorting={sorting}
              onSortingChange={onSortingChange}
              loading={loading}
              emptyMessage="Nessun template trovato."
            />

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