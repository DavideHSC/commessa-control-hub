import { Conto } from "@/types";
import { PaginatedResponse } from ".";

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

export const createConto = async (conto: Omit<Conto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Conto> => {
    return fetchData<Conto>(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(conto),
    });
};

export const updateConto = async (id: string, conto: Partial<Conto>): Promise<Conto> => {
    return fetchData<Conto>(`${API_BASE_URL}/${id}`, {
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

interface ConfigurableConto {
    id: string;
    codice: string;
    nome: string;
    isRilevantePerCommesse: boolean;
}

export const getConfigurableConti = async (): Promise<ConfigurableConto[]> => {
  const { data } = await fetchData<{ data: ConfigurableConto[] }>('/api/conti/configurabili');
  return data;
};

export const toggleContoRelevance = async (id: string, isRilevante: boolean): Promise<{ id: string, isRilevantePerCommesse: boolean }> => {
  return fetchData<{ id: string, isRilevantePerCommesse: boolean }>(`/api/conti/${id}/toggle-rilevanza`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isRilevante }),
  });
}; 