import { Conto, VoceAnalitica } from "@prisma/client";
import { PaginatedResponse } from ".";

export type ContoWithRelations = Conto & {
  vociAnalitiche: VoceAnalitica[];
};

const API_BASE_URL = '/api/conti';

// Funzione di utilità per il fetch dei dati
const fetchData = async <T>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Errore generico' }));
        throw new Error(errorData.message || 'Errore di rete');
    }
    return response.json();
};

export const getConti = async (params: Record<string, string | number> = {}): Promise<PaginatedResponse<Conto>> => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return fetchData<PaginatedResponse<Conto>>(`${API_BASE_URL}?${query}`);
};

export const createConto = async (conto: Omit<Conto, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContoWithRelations> => {
    return fetchData<ContoWithRelations>(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conto),
    });
};

export const updateConto = async (id: string, conto: Partial<Conto>): Promise<ContoWithRelations> => {
    return fetchData<ContoWithRelations>(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conto),
    });
};

export const deleteConto = async (id: string): Promise<void> => {
    await fetchData(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
    });
};


// =============================================
// Funzioni per la configurazione della rilevanza
// =============================================

export const toggleContoRelevance = async (id: string, isRilevante: boolean): Promise<{ id: string, isRilevantePerCommesse: boolean }> => {
  return fetchData<{ id: string, isRilevantePerCommesse: boolean }>(`/api/conti/${id}/toggle-rilevanza`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRilevante }),
  });
}; 

export const getContiPerSelezione = async (): Promise<Pick<Conto, 'id' | 'codice' | 'nome'>[]> => {
    const response = await fetch(`${API_BASE_URL}/select`);
    if (!response.ok) {
        throw new Error('Errore nel recupero dei conti per la selezione');
    }
    return response.json();
}

export const updateContoRelevance = async (id: string, isRilevante: boolean) => {
    const response = await fetch(`${API_BASE_URL}/conti/${id}/toggle-rilevanza`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRilevante }),
  });
}; 