"use client";

import React, { useState } from 'react';
import { ImportTemplate } from '@prisma/client';
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
import { TemplateFormDialog, ImportTemplateWithRelations } from './TemplateFormDialog'; 
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import {
  createImportTemplate,
  updateImportTemplate,
} from "@/api/importTemplates";

const ImportTemplatesAdmin: React.FC = () => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<ImportTemplateWithRelations | null>(null);
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
      initialSorting: [{ id: 'name', desc: false }]
    });

    const handleEdit = (template: ImportTemplate) => {
        setSelectedTemplate(template as ImportTemplateWithRelations);
        setIsDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!deletingTemplate) return;
        try {
            await deleteImportTemplate(deletingTemplate.id);
            toast.success(`Template "${deletingTemplate.name}" eliminato con successo.`);
            refreshData();
        } catch (error) {
            toast.error((error as Error).message);
        } finally {
            setDeletingTemplate(null);
        }
    };
    
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedTemplate(null);
    }

    const handleFormSubmit = async (data: any) => {
        try {
            if (selectedTemplate) {
                await updateImportTemplate(selectedTemplate.id, data);
                toast.success(`Template "${data.name}" aggiornato con successo.`);
            } else {
                await createImportTemplate(data);
                toast.success(`Template "${data.name}" creato con successo.`);
            }
            refreshData();
            handleCloseDialog();
        } catch (error) {
            toast.error((error as Error).message);
        }
    };

    const columns = getColumns(handleEdit, (template) => setDeletingTemplate(template));

    return (
        <div>
            <div className="flex justify-end mb-4">
                <Button onClick={() => { setSelectedTemplate(null); setIsDialogOpen(true); }}>
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
                isOpen={isDialogOpen}
                onClose={handleCloseDialog}
                onSubmit={handleFormSubmit}
                initialData={selectedTemplate}
            /> 
            
            <AlertDialog open={!!deletingTemplate} onOpenChange={() => setDeletingTemplate(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vuoi davvero eliminare il template "<b>{deletingTemplate?.name}</b>"? 
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