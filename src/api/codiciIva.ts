export interface CodiceIva {
  id: string;
  externalId?: string;
  descrizione: string;
  aliquota: number;
}

export const getCodiciIva = async (): Promise<CodiceIva[]> => {
  const response = await fetch('/api/codici-iva');
  if (!response.ok) {
    throw new Error('Errore nel caricamento dei codici IVA');
  }
  return response.json();
};

export const createCodiceIva = async (data: { id: string; descrizione: string; aliquota: number; externalId?: string }): Promise<CodiceIva> => {
  const response = await fetch('/api/codici-iva', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nella creazione del codice IVA');
  }
  
  return response.json();
};

export const updateCodiceIva = async (id: string, data: { descrizione: string; aliquota: number; externalId?: string }): Promise<CodiceIva> => {
  const response = await fetch(`/api/codici-iva/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'aggiornamento del codice IVA');
  }
  
  return response.json();
};

export const deleteCodiceIva = async (id: string): Promise<void> => {
  const response = await fetch(`/api/codici-iva/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'eliminazione del codice IVA');
  }
}; 