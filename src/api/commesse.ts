import { Commessa } from "@/types";

const API_BASE_URL = '/api/commesse';

export const getCommesse = async (): Promise<Commessa[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle commesse');
    }
    const result = await response.json();
    return result.data;
};

export const createCommessa = async (data: Partial<Commessa>): Promise<Commessa> => {
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

export const updateCommessa = async (id: string, data: Partial<Commessa>): Promise<Commessa> => {
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