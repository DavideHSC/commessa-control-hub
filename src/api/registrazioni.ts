import { ScritturaContabile } from "@/types";

const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Recupera tutte le scritture contabili dal server.
 * @returns Una Promise che si risolve con l'array di tutte le scritture.
 */
export const getRegistrazioni = async (): Promise<ScritturaContabile[]> => {
  const response = await fetch(`${API_BASE_URL}/registrazioni`);
  if (!response.ok) {
    throw new Error('Errore nel recupero delle registrazioni');
  }
  return response.json();
};

/**
 * Trova una singola scrittura contabile tramite il suo ID dal server.
 * @param id L'ID della scrittura da trovare.
 * @returns Una Promise che si risolve con la scrittura trovata o `null`.
 */
export const getRegistrazioneById = async (id: string): Promise<ScritturaContabile | null> => {
  const response = await fetch(`${API_BASE_URL}/registrazioni/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Errore nel recupero della registrazione');
  }
  return response.json();
};

/**
 * Aggiunge una nuova scrittura contabile al server.
 * @param scritturaData I dati della nuova scrittura.
 * @returns Una Promise che si risolve con la scrittura appena creata.
 */
export const addRegistrazione = async (scritturaData: Omit<ScritturaContabile, 'id'>): Promise<ScritturaContabile> => {
  const response = await fetch(`${API_BASE_URL}/registrazioni`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scritturaData),
  });
  if (!response.ok) {
    throw new Error('Errore nell\'aggiunta della registrazione');
  }
  return response.json();
};

/**
 * Aggiorna una scrittura contabile esistente sul server.
 * @param registrazione La scrittura contabile da aggiornare.
 * @returns Una Promise che si risolve con la scrittura aggiornata.
 */
export const updateRegistrazione = async (registrazione: ScritturaContabile): Promise<ScritturaContabile> => {
  const response = await fetch(`${API_BASE_URL}/registrazioni/${registrazione.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registrazione),
  });
  if (!response.ok) {
    throw new Error('Errore nell\'aggiornamento della registrazione');
  }
  return response.json();
};

/**
 * Elimina una scrittura contabile dal server.
 * @param id L'ID della scrittura da eliminare.
 * @returns Una Promise che si risolve quando l'eliminazione ha successo.
 */
export const deleteRegistrazione = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/registrazioni/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Errore durante l\'eliminazione della registrazione');
  }
};