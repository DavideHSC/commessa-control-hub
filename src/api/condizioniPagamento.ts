export interface CondizionePagamento {
  id: string;
  externalId?: string;
  descrizione: string;
}

export const getCondizioniPagamento = async (): Promise<CondizionePagamento[]> => {
  const response = await fetch('/api/condizioni-pagamento');
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle condizioni di pagamento');
  }
  return response.json();
};

export const createCondizionePagamento = async (data: { id: string; descrizione: string; externalId?: string }): Promise<CondizionePagamento> => {
  const response = await fetch('/api/condizioni-pagamento', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nella creazione della condizione di pagamento');
  }
  
  return response.json();
};

export const updateCondizionePagamento = async (id: string, data: { descrizione: string; externalId?: string }): Promise<CondizionePagamento> => {
  const response = await fetch(`/api/condizioni-pagamento/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'aggiornamento della condizione di pagamento');
  }
  
  return response.json();
};

export const deleteCondizionePagamento = async (id: string): Promise<void> => {
  const response = await fetch(`/api/condizioni-pagamento/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Errore nell\'eliminazione della condizione di pagamento');
  }
}; 