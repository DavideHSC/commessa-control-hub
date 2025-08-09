import { Fornitore } from '@prisma/client';

const API_URL = '/api/fornitori';

export const getFornitori = async (): Promise<Fornitore[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Errore nel caricamento dei fornitori');
  }
  return response.json();
};

export const createFornitore = async (fornitore: Omit<Fornitore, 'id'>): Promise<Fornitore> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fornitore),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nella creazione del fornitore');
  }
  return response.json();
};

export const updateFornitore = async (id: string, fornitore: Partial<Omit<Fornitore, 'id'>>): Promise<Fornitore> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fornitore),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nell\'aggiornamento del fornitore');
  }
  return response.json();
};

export const deleteFornitore = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nell\'eliminazione del fornitore');
  }
}; 