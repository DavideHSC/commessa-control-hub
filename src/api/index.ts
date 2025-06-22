import { Commessa, VoceAnalitica, Conto, ScritturaContabile, CausaleContabile, Cliente, Fornitore, CodiceIva, CondizionePagamento, ImportTemplate } from '@/types';
import qs from 'qs';

const API_BASE_URL = '/api';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Simula un ritardo di rete per un'esperienza più realistica
const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// Generic fetch function for paginated data
const fetchPaginatedData = async <T>(endpoint: string, params: Record<string, any> = {}): Promise<PaginatedResponse<T>> => {
  const query = qs.stringify({ limit: 10, ...params }, { skipNulls: true, arrayFormat: 'brackets' });
  const response = await fetch(`${endpoint}?${query}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Errore nel recupero dei dati' }));
    throw new Error(errorData.message || 'Errore di rete');
  }
  return response.json();
};

async function fetchData<T>(endpoint: string, errorMessage: string): Promise<T> {
  const response = await fetch(`/api${endpoint}`);
   if (!response.ok) {
     console.error(`Errore nel caricamento: ${response.statusText}`);
     throw new Error(errorMessage);
   }
  return response.json() as Promise<T>;
}

// --- API Functions ---

export const getScrittureContabili = (params?: Record<string, any>) => fetchPaginatedData<ScritturaContabile>('/api/registrazioni', params);
export const getCommesse = (params?: Record<string, any>) => fetchPaginatedData<Commessa>('/api/commesse', params);
export const getClienti = (params?: Record<string, any>) => fetchPaginatedData<Cliente>('/api/clienti', params);
export const getFornitori = (params?: Record<string, any>) => fetchPaginatedData<Fornitore>('/api/fornitori', params);
export const getPianoDeiConti = (params?: Record<string, any>) => fetchPaginatedData<Conto>('/api/conti', params);
export const getVociAnalitiche = (params?: Record<string, any>) => fetchPaginatedData<VoceAnalitica>('/api/voci-analitiche', params);
export const getCausaliContabili = (params?: Record<string, any>) => fetchPaginatedData<CausaleContabile>('/api/causali', params);
export const getCodiciIva = (params?: Record<string, any>) => fetchPaginatedData<CodiceIva>('/api/codici-iva', params);
export const getCondizioniPagamento = (params?: Record<string, any>) => fetchPaginatedData<CondizionePagamento>('/api/condizioni-pagamento', params);
export const getImportTemplates = (params?: Record<string, any>) => fetchPaginatedData<ImportTemplate>('/api/import-templates', params);

export const getDashboardData = () => fetchData<any>('/dashboard', 'Errore nel caricamento dei dati della dashboard');

export const resetDatabase = async () => {
  const response = await fetch('/api/system/reset-database', { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Errore generico durante il reset del database.' }));
    throw new Error(errorData.message || 'Errore di rete');
  }
  return response.json();
};

// In futuro aggiungeremo qui le funzioni per recuperare e salvare le scritture contabili. 

// Qui potremmo aggiungere funzioni per creare/aggiornare/eliminare dati,
// che in un'app reale farebbero chiamate a un backend API. 

export * as causali from './causali';
export * as clienti from './clienti';
export * as codiciIva from './codiciIva';
export * as fornitori from './fornitori';
export * as importTemplates from './importTemplates';
export * as registrazioni from './registrazioni';
export * as vociAnalitiche from './vociAnalitiche';

export const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    // ... existing code ...
  });
  // ... existing code ...
}; 