import { ImportTemplate } from "@/types";

export const getImportTemplates = async (): Promise<ImportTemplate[]> => {
    const response = await fetch('/api/import-templates');
    if (!response.ok) {
        throw new Error('Errore nel recupero dei template di importazione');
    }
    return response.json();
};

export const createImportTemplate = async (templateData: Omit<ImportTemplate, 'id' | 'fields'> & { fields: Omit<ImportTemplate['fields'][0], 'id'>[] }): Promise<ImportTemplate> => {
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


export const updateImportTemplate = async (id: string, templateData: Omit<ImportTemplate, 'id'>): Promise<ImportTemplate> => {
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