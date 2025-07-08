import { VoceAnalitica } from "@/types";

const API_BASE_URL = '/api/voci-analitiche';

export const getVociAnalitiche = async (): Promise<VoceAnalitica[]> => {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle voci analitiche');
    }
    const result = await response.json();
    return result.data;
};

export const createVoceAnalitica = async (data: Partial<VoceAnalitica>): Promise<VoceAnalitica> => {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nella creazione della voce analitica');
    }
    return response.json();
};

export const updateVoceAnalitica = async (id: string, data: Partial<VoceAnalitica>): Promise<VoceAnalitica> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento della voce analitica');
    }
    return response.json();
};

export const deleteVoceAnalitica = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della voce analitica');
    }
}; 