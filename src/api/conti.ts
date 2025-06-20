import { Conto } from "@/types";

const API_BASE_URL = '/api/conti';

export const getConti = async (): Promise<Conto[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero dei conti');
    }
    return response.json();
};

export const createConto = async (data: Conto): Promise<Conto> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione del conto');
    }
    return response.json();
};

export const updateConto = async (id: string, data: Partial<Conto>): Promise<Conto> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento del conto');
    }
    return response.json();
};

export const deleteConto = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione del conto');
    }
}; 