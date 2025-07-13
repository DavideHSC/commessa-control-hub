import { Commessa, VoceAnalitica, Conto, ScritturaContabile, CausaleContabile, Cliente, Fornitore, CodiceIva, CondizionePagamento, ImportTemplate } from '@prisma/client';
import { TableStats, DashboardData } from '../types';
import qs from 'qs';
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
});

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
const fetchPaginatedData = async <T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T[]> => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
  if (!response.ok) {
    throw new Error(`Errore nel caricamento di ${endpoint}`);
  }
  const result: PaginatedResponse<T> = await response.json();
  return result.data;
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

export const getScrittureContabili = (params?: Record<string, unknown>) => fetchPaginatedData<ScritturaContabile>('scritture', params);
export const getCommesse = (params?: Record<string, unknown>) => fetchPaginatedData<Commessa>('commesse', params);
export const getClienti = (params?: Record<string, unknown>) => fetchPaginatedData<Cliente>('clienti', params);
export const getFornitori = (params?: Record<string, unknown>) => fetchPaginatedData<Fornitore>('fornitori', params);
export const getPianoDeiConti = (params?: Record<string, unknown>) => fetchPaginatedData<Conto>('conti', params);
export const getVociAnalitiche = (params?: Record<string, unknown>) => fetchPaginatedData<VoceAnalitica>('voci-analitiche', params);
export const getCausaliContabili = (params?: Record<string, unknown>) => {
  // Se non sono specificati parametri, recupera tutti i record.
  const queryParams = params || { all: 'true' };
  return fetchPaginatedData<CausaleContabile>('causali', queryParams);
};
export const getCodiciIva = (params?: Record<string, unknown>) => fetchPaginatedData<CodiceIva>('codici-iva', params);
export const getCondizioniPagamento = (params?: Record<string, unknown>) => fetchPaginatedData<CondizionePagamento>('condizioni-pagamento', params);
export const getImportTemplates = (params?: Record<string, unknown>) => fetchPaginatedData<ImportTemplate>('/api/import-templates', params);

export const getDashboardData = () => fetchData<DashboardData>('/dashboard', 'Errore nel caricamento dei dati della dashboard');

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

export const backupDatabase = async () => {
  const response = await fetch('/api/database/backup', { method: 'POST' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Errore generico durante il backup del database.' }));
    throw new Error(errorData.message || 'Errore di rete');
  }
  return response.json();
};

export const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, {
    // ... existing code ...
  });
  // ... existing code ...
};