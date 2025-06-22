import qs from 'qs';
const API_BASE_URL = '/api';
// Simula un ritardo di rete per un'esperienza più realistica
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));
// Generic fetch function for paginated data
const fetchPaginatedData = async (endpoint, params = {}) => {
    const query = qs.stringify({ limit: 10, ...params }, { skipNulls: true, arrayFormat: 'brackets' });
    const response = await fetch(`${endpoint}?${query}`);
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Errore nel recupero dei dati' }));
        throw new Error(errorData.message || 'Errore di rete');
    }
    return response.json();
};
async function fetchData(endpoint, errorMessage) {
    const response = await fetch(`/api${endpoint}`);
    if (!response.ok) {
        console.error(`Errore nel caricamento: ${response.statusText}`);
        throw new Error(errorMessage);
    }
    return response.json();
}
// --- API Functions ---
export const getScrittureContabili = (params) => fetchPaginatedData('/api/registrazioni', params);
export const getCommesse = (params) => fetchPaginatedData('/api/commesse', params);
export const getClienti = (params) => fetchPaginatedData('/api/clienti', params);
export const getFornitori = (params) => fetchPaginatedData('/api/fornitori', params);
export const getPianoDeiConti = (params) => fetchPaginatedData('/api/conti', params);
export const getVociAnalitiche = (params) => fetchPaginatedData('/api/voci-analitiche', params);
export const getCausaliContabili = (params) => fetchPaginatedData('/api/causali', params);
export const getCodiciIva = (params) => fetchPaginatedData('/api/codici-iva', params);
export const getCondizioniPagamento = (params) => fetchPaginatedData('/api/condizioni-pagamento', params);
export const getImportTemplates = (params) => fetchPaginatedData('/api/import-templates', params);
export const getDashboardData = () => fetchData('/dashboard', 'Errore nel caricamento dei dati della dashboard');
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
export const fetchJson = async (url, options) => {
    const response = await fetch(url, {
    // ... existing code ...
    });
    // ... existing code ...
};
