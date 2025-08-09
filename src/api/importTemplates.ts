import { ImportTemplate, FieldDefinition } from "@prisma/client";

// Tipo che include le relazioni
type ImportTemplateWithRelations = ImportTemplate & {
    fieldDefinitions: FieldDefinition[];
};

export const getImportTemplates = async (): Promise<ImportTemplateWithRelations[]> => {
    const response = await fetch('/api/import-templates');
    if (!response.ok) {
        throw new Error('Errore nel recupero dei template di importazione');
    }
    return response.json();
};

export const createImportTemplate = async (templateData: Omit<ImportTemplate, 'id'> & { fields: Omit<FieldDefinition, 'id' | 'templateId'>[] }): Promise<ImportTemplateWithRelations> => {
    const response = await fetch('/api/import-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione del template');
    }
    return response.json();
};


export const updateImportTemplate = async (id: string, templateData: Omit<ImportTemplate, 'id'>): Promise<ImportTemplateWithRelations> => {
    const response = await fetch(`/api/import-templates/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del template');
    }
    return response.json();
};


export const deleteImportTemplate = async (id: string): Promise<void> => {
    const response = await fetch(`/api/import-templates/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del template');
    }
}; 