"use client";

import React, { useState } from 'react';
import { ImportTemplate } from '@prisma/client';
import { deleteImportTemplate } from '@/api/importTemplates';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, FileText, Settings, Trash2 } from 'lucide-react';
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
import { ImportTemplateWithRelations } from './TemplateFormDialog'; 
import { useAdvancedTable } from '@/hooks/useAdvancedTable';
import { AdvancedDataTable } from '../ui/advanced-data-table';
import {
  updateImportTemplate,
  createImportTemplate,
} from "@/api/importTemplates";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, X } from 'lucide-react';
import { FieldsEditor } from './FieldsEditor';

const ImportTemplatesAdmin: React.FC = () => {
    const [deletingTemplate, setDeletingTemplate] = useState<ImportTemplate | null>(null);
    const [detailTemplate, setDetailTemplate] = useState<ImportTemplateWithRelations | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [editFormData, setEditFormData] = useState<any>({});

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

    const handleSelectTemplate = (template: ImportTemplate) => {
        setDetailTemplate(template as ImportTemplateWithRelations);
        setIsEditing(false);
        setIsCreatingNew(false);
    };

    const handleCreateNew = () => {
        setEditFormData({
            name: '',
            modelName: '',
            fileIdentifier: '',
            fieldDefinitions: []
        });
        setDetailTemplate(null);
        setIsCreatingNew(true);
        setIsEditing(true);
    };

    const handleEdit = () => {
        if (detailTemplate) {
            setEditFormData({
                name: detailTemplate.name || '',
                modelName: detailTemplate.modelName || '',
                fileIdentifier: detailTemplate.fileIdentifier || '',
                fieldDefinitions: detailTemplate.fieldDefinitions || []
            });
            setIsEditing(true);
        }
    };

    const handleCancelEdit = () => {
        if (isCreatingNew) {
            // Se stiamo creando un nuovo template, torniamo allo stato iniziale
            setIsCreatingNew(false);
            setDetailTemplate(null);
        }
        setIsEditing(false);
    };

    const handleSaveEdit = async () => {
        try {
            if (isCreatingNew) {
                // Creazione nuovo template
                const newTemplate = await createImportTemplate(editFormData);
                toast.success(`Template "${editFormData.name}" creato con successo.`);
                setDetailTemplate(newTemplate);
                setIsCreatingNew(false);
            } else if (detailTemplate) {
                // Aggiornamento template esistente
                await updateImportTemplate(detailTemplate.id, editFormData);
                toast.success(`Template "${editFormData.name}" aggiornato con successo.`);
                
                // Aggiorna il template nel dettaglio
                const updatedTemplate = { ...detailTemplate, ...editFormData };
                setDetailTemplate(updatedTemplate);
            }
            
            setIsEditing(false);
            refreshData();
        } catch (error) {
            toast.error((error as Error).message);
        }
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
    

    // Colonne ottimizzate per la lista master 
    const masterColumns = [
        {
            accessorKey: "name",
            header: "Template",
            cell: ({ row }: { row: any }) => {
                const template = row.original;
                const isSelected = detailTemplate?.id === template.id;
                const fieldCount = template.fieldDefinitions?.length || 0;
                const fileIdentifiers = template.fieldDefinitions
                    ?.filter((f: any) => f.fileIdentifier)
                    .map((f: any) => f.fileIdentifier)
                    .filter((value: string, index: number, self: string[]) => self.indexOf(value) === index) || [];
                
                return (
                    <div 
                        className={`cursor-pointer p-3 rounded-lg transition-all duration-200 border ${
                            isSelected 
                                ? 'bg-blue-50 border-blue-300 shadow-sm' 
                                : 'hover:bg-gray-50 hover:border-gray-300 border-transparent'
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-1.5 rounded ${isSelected ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <FileText size={14} className={isSelected ? 'text-blue-600' : 'text-gray-600'} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className={`font-medium text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                                    {template.name || 'Template senza nome'}
                                </div>
                                {template.modelName && (
                                    <div className="text-xs text-gray-500 truncate">
                                        {template.modelName}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <Badge 
                                variant={fieldCount > 0 ? "default" : "secondary"} 
                                className={`text-xs ${
                                    fieldCount > 0 
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                                        : 'bg-gray-100 text-gray-600'
                                }`}
                            >
                                {fieldCount} camp{fieldCount === 1 ? 'o' : 'i'}
                            </Badge>
                            
                            {fileIdentifiers.length > 0 && (
                                <div className="flex gap-1">
                                    {fileIdentifiers.slice(0, 2).map((id: string, index: number) => (
                                        <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                                            {id.replace('.TXT', '').substring(0, 6)}
                                        </Badge>
                                    ))}
                                    {fileIdentifiers.length > 2 && (
                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                            +{fileIdentifiers.length - 2}
                                        </Badge>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="h-full flex flex-col">
            {/* Header con pulsante Aggiungi */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Lista Template</h2>
                <Button onClick={handleCreateNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuovo Template
                </Button>
            </div>
            
            {/* Layout Master-Detail con proporzioni ottimizzate */}
            <div className="flex gap-6 flex-1 min-h-0">
                {/* Pannello Sinistro - Lista Template (Master) - 35% dello spazio */}
                <Card className="w-2/5 flex flex-col min-w-0">
                    <CardHeader className="flex-shrink-0 pb-3">
                        <CardTitle className="text-base flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={18} className="text-gray-600" />
                                Template
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {templates.length} totali
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <div className="h-full overflow-hidden">
            <AdvancedDataTable
                              columns={masterColumns}
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
                        </div>
                    </CardContent>
                </Card>

                {/* Pannello Destro - Dettagli Template (Detail) - 65% dello spazio */}
                <Card className="w-3/5 flex flex-col min-w-0">
                    <CardHeader className="flex-shrink-0">
                        {(detailTemplate || isCreatingNew) ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Settings size={18} className={isEditing ? "text-orange-600" : "text-blue-600"} />
                                    <div>
                                        <CardTitle className="text-base">
                                            {isCreatingNew ? "Nuovo Template" : 
                                             isEditing ? `Modifica: ${detailTemplate?.name}` : 
                                             detailTemplate?.name}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {isCreatingNew ? "Creazione nuovo template" :
                                             isEditing ? "Modalità editing attiva" : 
                                             `${detailTemplate?.fieldDefinitions?.length || 0} campi definiti`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="flex items-center gap-2"
                                            >
                                                <X size={14} />
                                                Annulla
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSaveEdit}
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                                            >
                                                <Save size={14} />
                                                Salva
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleEdit}
                                                className="flex items-center gap-2"
                                            >
                                                <Edit3 size={14} />
                                                Modifica
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setDeletingTemplate(detailTemplate)}
                                                className="flex items-center gap-2 text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 size={14} />
                                                Elimina
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-500">
                                <Settings size={18} />
                                <CardTitle className="text-base">Seleziona un template</CardTitle>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        {(detailTemplate || isCreatingNew) ? (
                            <div className="h-full flex flex-col">
                                {isEditing ? (
                                    /* FORM DI EDITING */
                                    <div className="flex flex-col h-full">
                                        {/* Sezione Fixed - Informazioni Base */}
                                        <div className="flex-shrink-0 space-y-4 mb-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Nome Template *</Label>
                                                    <Input
                                                        id="name"
                                                        value={editFormData.name || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                                        placeholder="Inserisci nome template"
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="modelName">Nome Modello</Label>
                                                    <Input
                                                        id="modelName"
                                                        value={editFormData.modelName || ''}
                                                        onChange={(e) => setEditFormData({ ...editFormData, modelName: e.target.value })}
                                                        placeholder="Inserisci nome modello"
                                                        className="w-full"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="fileIdentifier">Identificativo File</Label>
                                                <Input
                                                    id="fileIdentifier"
                                                    value={editFormData.fileIdentifier || ''}
                                                    onChange={(e) => setEditFormData({ ...editFormData, fileIdentifier: e.target.value })}
                                                    placeholder="Es. PNTESTA.TXT"
                                                    className="w-full"
                                                />
                                            </div>

                                            <Separator />
                                        </div>

                                        {/* Sezione Espandibile - Definizioni Campi */}
                                        <div className="flex flex-col flex-1 min-h-0">
                                            <div className="flex items-center justify-between mb-4 flex-shrink-0">
                                                <h4 className="text-base font-semibold text-gray-900">Definizioni Campi</h4>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => {
                                                        const newField = {
                                                            fieldName: `Campo${(editFormData.fieldDefinitions?.length || 0) + 1}`,
                                                            start: 1,
                                                            length: 10,
                                                            end: 10,
                                                            format: '',
                                                            fileIdentifier: ''
                                                        };
                                                        setEditFormData({
                                                            ...editFormData,
                                                            fieldDefinitions: [...(editFormData.fieldDefinitions || []), newField]
                                                        });
                                                    }}
                                                >
                                                    <PlusCircle className="w-4 h-4 mr-2" />
                                                    Aggiungi Campo
                                                </Button>
                                            </div>
                                            
                                            <FieldsEditor
                                                fieldDefinitions={editFormData.fieldDefinitions || []}
                                                onChange={(fields) => setEditFormData({
                                                    ...editFormData,
                                                    fieldDefinitions: fields
                                                })}
                                                fullHeight={true}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* VISUALIZZAZIONE NORMALE */
                                    <div className="overflow-y-auto">
                                        {/* Informazioni generali in layout compatto */}
                                        {detailTemplate && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <label className="text-xs font-medium text-blue-700 uppercase">Nome Template</label>
                                        <p className="mt-1 text-blue-900 font-semibold text-sm">{detailTemplate.name}</p>
                                    </div>
                                    {detailTemplate.modelName && (
                                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                            <label className="text-xs font-medium text-green-700 uppercase">Modello</label>
                                            <p className="mt-1 text-green-900 font-semibold text-sm">{detailTemplate.modelName}</p>
                                        </div>
                                    )}
                                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                        <label className="text-xs font-medium text-purple-700 uppercase">Campi Totali</label>
                                        <p className="mt-1 text-purple-900 font-semibold text-sm">
                                            {detailTemplate.fieldDefinitions?.length || 0}
                                        </p>
                                    </div>
                                </div>
                                        )}

                                {/* Definizioni campi ottimizzate */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                            <Settings size={16} className="text-gray-600" />
                                            Definizioni Campi
                                        </h4>
                                    </div>
                                    
                                    {detailTemplate?.fieldDefinitions && detailTemplate.fieldDefinitions.length > 0 ? (
                                        <div className="space-y-3">
                                            {/* Raggruppamento per fileIdentifier se esistente */}
                                            {(() => {
                                                const sortedFields = detailTemplate?.fieldDefinitions?.sort((a, b) => a.start - b.start) || [];
                                                const fieldsByIdentifier = sortedFields.reduce((acc: any, field: any) => {
                                                    const identifier = field.fileIdentifier || 'default';
                                                    if (!acc[identifier]) acc[identifier] = [];
                                                    acc[identifier].push(field);
                                                    return acc;
                                                }, {});

                                                return Object.entries(fieldsByIdentifier).map(([identifier, fields]: [string, any]) => (
                                                    <div key={identifier} className="space-y-3">
                                                        {identifier !== 'default' && (
                                                            <div className="flex items-center gap-2 pt-4 first:pt-0">
                                                                <Badge variant="default" className="bg-indigo-100 text-indigo-800">
                                                                    {identifier}
                                                                </Badge>
                                                                <div className="flex-1 h-px bg-gray-200"></div>
                                                                <span className="text-xs text-gray-500">{fields.length} campi</span>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {fields.map((field: any, index: number) => (
                                                                <div key={field.id || index} className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <div className="font-medium text-sm text-gray-900 truncate">
                                                                                {field.fieldName || `Campo ${index + 1}`}
                                                                            </div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                Pos: {field.start}-{field.end} • Len: {field.length}
                                                                            </div>
                                                                        </div>
                                                                        {field.format && (
                                                                            <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                                                                                {field.format}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    {/* Barra visuale della posizione */}
                                                                    <div className="mt-2">
                                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                                            <span>{field.start}</span>
                                                                            <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                                <div 
                                                                                    className="h-full bg-blue-400 rounded-full"
                                                                                    style={{ 
                                                                                        width: `${Math.min(100, (field.length / 50) * 100)}%` 
                                                                                    }}
                                                                                ></div>
                                                                            </div>
                                                                            <span>{field.end}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ));
                                            })()}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-500">
                                            <FileText size={32} className="mx-auto mb-4 opacity-30" />
                                            <p className="text-lg font-medium mb-2">Nessuna definizione di campo</p>
                                            <p className="text-sm">Aggiungi definizioni per iniziare a utilizzare questo template</p>
                                        </div>
                                    )}
                                </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <div className="text-center">
                                    <Settings size={48} className="mx-auto mb-4 opacity-30" />
                                    <p className="text-lg font-medium mb-2">Nessun template selezionato</p>
                                    <p className="text-sm">Clicca su un template nella lista per visualizzarne i dettagli</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            
            {/* Dialog conferma eliminazione */}
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