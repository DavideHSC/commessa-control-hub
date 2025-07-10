import { RegolaRipartizione } from '@/types';

const API_BASE_URL = '/api';

export type RegolaRipartizioneInput = Omit<RegolaRipartizione, 'id' | 'createdAt' | 'updatedAt' | 'conto' | 'commessa' | 'voceAnalitica'>;

export const getRegoleRipartizione = async (): Promise<RegolaRipartizione[]> => {
  const response = await fetch(`${API_BASE_URL}/regole-ripartizione`);
  if (!response.ok) {
    throw new Error('Errore nel recupero delle regole di ripartizione');
  }
  return response.json();
};

export const createRegolaRipartizione = async (data: RegolaRipartizioneInput): Promise<RegolaRipartizione> => {
  const response = await fetch(`${API_BASE_URL}/regole-ripartizione`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nella creazione della regola di ripartizione');
  }
  return response.json();
};

export const updateRegolaRipartizione = async (id: string, data: RegolaRipartizioneInput): Promise<RegolaRipartizione> => {
  const response = await fetch(`${API_BASE_URL}/regole-ripartizione/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || `Errore nell'aggiornamento della regola di ripartizione`);
  }
  return response.json();
};

export const deleteRegolaRipartizione = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/regole-ripartizione/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Errore nell'eliminazione della regola di ripartizione`);
  }
}; 