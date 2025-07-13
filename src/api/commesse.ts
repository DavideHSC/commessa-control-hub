import { Commessa, Cliente, BudgetVoce } from "@prisma/client";

const API_BASE_URL = '/api/commesse';

export type CommessaWithRelations = Commessa & {
  cliente: Cliente;
  parent: Commessa | null;
  children: Commessa[];
  budget: BudgetVoce[];
};

export const getCommesse = async (): Promise<CommessaWithRelations[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle commesse');
    }
    const result = await response.json();
    return result.data;
};

export const createCommessa = async (data: Partial<Commessa>): Promise<CommessaWithRelations> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione della commessa');
    }
    return response.json();
};

export const updateCommessa = async (id: string, data: Partial<Commessa>): Promise<CommessaWithRelations> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento della commessa');
    }
    return response.json();
};

export const deleteCommessa = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della commessa');
    }
};

export const getCommesseForSelect = async (): Promise<{id: string, nome: string}[]> => {
    const response = await fetch(`${API_BASE_URL}/select`);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle commesse per la selezione');
    }
    return response.json();
} 