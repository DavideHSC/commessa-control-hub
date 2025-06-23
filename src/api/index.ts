import { Commessa, VoceAnalitica, Conto, ScritturaContabile, CausaleContabile, Cliente, Fornitore, CodiceIva, CondizionePagamento, ImportTemplate, TableStats } from '@/types';
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
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
  if (!response.ok) {
    throw new Error(`Errore nel caricamento di ${endpoint}`);
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

export const getScrittureContabili = (params?: Record<string, any>) => fetchPaginatedData<ScritturaContabile>('scritture', params);
export const getCommesse = (params?: Record<string, any>) => fetchPaginatedData<Commessa>('commesse', params);
export const getClienti = (params?: Record<string, any>) => fetchPaginatedData<Cliente>('clienti', params);
export const getFornitori = (params?: Record<string, any>) => fetchPaginatedData<Fornitore>('fornitori', params);
export const getPianoDeiConti = (params?: Record<string, any>) => fetchPaginatedData<Conto>('conti', params);
export const getVociAnalitiche = (params?: Record<string, any>) => fetchPaginatedData<VoceAnalitica>('voci-analitiche', params);
export const getCausaliContabili = (params?: Record<string, any>) => fetchPaginatedData<CausaleContabile>('causali', params);
export const getCodiciIva = (params?: Record<string, any>) => fetchPaginatedData<CodiceIva>('codici-iva', params);
export const getCondizioniPagamento = (params?: Record<string, any>) => fetchPaginatedData<CondizionePagamento>('condizioni-pagamento', params);
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

export const getDatabaseStats = async (): Promise<TableStats> => {
  const response = await fetch(`${API_BASE_URL}/database/stats`);
  if (!response.ok) {
    throw new Error('Errore nel recupero delle statistiche del database');
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