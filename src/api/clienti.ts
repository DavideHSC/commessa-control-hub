import { Cliente } from '@/types';

const API_URL = 'http://localhost:3001/api/clienti';

export const getClienti = async (): Promise<Cliente[]> => {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error('Errore nel caricamento dei clienti');
  }
  return response.json();
};

export const createCliente = async (cliente: Omit<Cliente, 'id'>): Promise<Cliente> => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nella creazione del cliente');
  }
  return response.json();
};

export const updateCliente = async (id: string, cliente: Partial<Omit<Cliente, 'id'>>): Promise<Cliente> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cliente),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nell\'aggiornamento del cliente');
  }
  return response.json();
};

export const deleteCliente = async (id: string): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
     const errorData = await response.json();
    throw new Error(errorData.error || 'Errore nell\'eliminazione del cliente');
  }
}; 