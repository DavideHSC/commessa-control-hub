import { CausaleContabile } from '@prisma/client';

export const getCausali = async (): Promise<CausaleContabile[]> => {
  const response = await fetch('/api/causali');
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle causali');
  }
  return response.json();
};

export const createCausale = async (data: Omit<CausaleContabile, 'id'> & { id: string }): Promise<CausaleContabile> => {
  const response = await fetch('/api/causali', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nella creazione della causale');
  }
  
  return response.json();
};

export const updateCausale = async (id: string, data: Partial<CausaleContabile>): Promise<CausaleContabile> => {
  const response = await fetch(`/api/causali/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'aggiornamento della causale');
  }
  
  return response.json();
};

export const deleteCausale = async (id: string): Promise<void> => {
  const response = await fetch(`/api/causali/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'eliminazione della causale');
  }
}; 