import { RegolaRipartizione } from '@prisma/client';
import {
  RegolaRipartizioneInput,
  regolaRipartizioneSchema,
} from '@/schemas/regolaRipartizioneSchema';

const API_BASE_URL = '/api/regole-ripartizione';

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


export const getRegoleRipartizione = async (): Promise<RegolaRipartizione[]> => {
  return fetchData<RegolaRipartizione[]>(API_BASE_URL);
};

export type { RegolaRipartizioneInput };
export { regolaRipartizioneSchema };

export const createRegolaRipartizione = async (data: RegolaRipartizioneInput): Promise<RegolaRipartizione> => {
    return fetchData<RegolaRipartizione>(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const updateRegolaRipartizione = async (id: string, data: Partial<RegolaRipartizioneInput>): Promise<RegolaRipartizione> => {
    return fetchData<RegolaRipartizione>(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
};

export const deleteRegolaRipartizione = async (id: string): Promise<void> => {
  await fetchData<void>(`${API_BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}; 