import { Commessa, VoceAnalitica, Conto, ScritturaContabile, CausaleContabile, Cliente, Fornitore, CodiceIva, CondizionePagamento } from '@/types';

const API_BASE_URL = '/api';

// Simula un ritardo di rete per un'esperienza più realistica
const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions ---

async function fetchData<T>(endpoint: string, errorMessage: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`);
  if (!response.ok) {
    console.error(`Errore nel caricamento: ${response.statusText}`);
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export const getCommesse = () => fetchData<Commessa[]>('/commesse', 'Errore nel caricamento delle commesse');
export const getClienti = () => fetchData<Cliente[]>('/clienti', 'Errore nel caricamento dei clienti');
export const getFornitori = () => fetchData<Fornitore[]>('/fornitori', 'Errore nel caricamento dei fornitori');
export const getVociAnalitiche = () => fetchData<VoceAnalitica[]>('/voci-analitiche', 'Errore nel caricamento delle voci analitiche');
export const getPianoDeiConti = () => fetchData<Conto[]>('/conti', 'Errore nel caricamento del piano dei conti');
export const getCausaliContabili = () => fetchData<CausaleContabile[]>('/causali', 'Errore nel caricamento delle causali contabili');
export const getCodiciIva = () => fetchData<CodiceIva[]>('/codici-iva', 'Errore nel caricamento dei codici IVA');
export const getCondizioniPagamento = () => fetchData<CondizionePagamento[]>('/condizioni-pagamento', 'Errore nel caricamento delle condizioni di pagamento');
export const getScrittureContabili = () => fetchData<ScritturaContabile[]>('/registrazioni', 'Errore nel caricamento delle scritture contabili');
export const getDashboardData = () => fetchData<any>('/dashboard', 'Errore nel caricamento dei dati della dashboard');

// In futuro aggiungeremo qui le funzioni per recuperare e salvare le scritture contabili. 

// Qui potremmo aggiungere funzioni per creare/aggiornare/eliminare dati,
// che in un'app reale farebbero chiamate a un backend API. 