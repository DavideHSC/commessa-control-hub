import { VoceAnalitica } from "@/types";
import { PaginatedResponse } from ".";

const API_BASE_URL = '/api/voci-analitiche';

// Funzione di utilità per il fetch dei dati
const fetchData = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Errore generico' }));
        throw new Error(errorData.message || 'Errore di rete');
    }
    // Per le risposte 204 (No Content), non c'è un corpo JSON da parsare
    if (response.status === 204) {
        return null as T;
    }
    return response.json();
};

export const getVociAnalitiche = async (
  params: Record<string, string | number> = {}
): Promise<PaginatedResponse<VoceAnalitica>> => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return fetchData<PaginatedResponse<VoceAnalitica>>(`${API_BASE_URL}?${query}`);
};

export const createVoceAnalitica = async (voce: Partial<VoceAnalitica> & { contiIds?: string[] }): Promise<VoceAnalitica> => {
    return fetchData<VoceAnalitica>(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voce),
    });
};

export const updateVoceAnalitica = async (id: string, voce: Partial<VoceAnalitica> & { contiIds?: string[] }): Promise<VoceAnalitica> => {
    return fetchData<VoceAnalitica>(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voce),
    });
};

export const deleteVoceAnalitica = async (id: string): Promise<void> => {
    await fetchData<void>(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
};

export const getVociAnalitichePerSelezione = async (): Promise<Pick<VoceAnalitica, 'id' | 'nome'>[]> => {
    const response = await fetch(`${API_BASE_URL}/voci-analitiche/select`);
    if (!response.ok) {
        throw new Error('Errore nel recupero delle voci analitiche per la selezione');
    }
    return response.json();
} 