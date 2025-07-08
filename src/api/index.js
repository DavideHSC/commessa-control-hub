const API_BASE_URL = '/api';
// Simula un ritardo di rete per un'esperienza più realistica
const networkDelay = (ms) => new Promise(res => setTimeout(res, ms));
// Generic fetch function for paginated data
const fetchPaginatedData = async (endpoint, params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
    if (!response.ok) {
        throw new Error(`Errore nel caricamento di ${endpoint}`);
    }
    const result = await response.json();
    return result.data;
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
export const getScrittureContabili = (params) => fetchPaginatedData('scritture', params);
export const getCommesse = (params) => fetchPaginatedData('commesse', params);
export const getClienti = (params) => fetchPaginatedData('clienti', params);
export const getFornitori = (params) => fetchPaginatedData('fornitori', params);
export const getPianoDeiConti = (params) => fetchPaginatedData('conti', params);
export const getVociAnalitiche = (params) => fetchPaginatedData('voci-analitiche', params);
export const getCausaliContabili = (params) => {
    // Se non sono specificati parametri, recupera tutti i record.
    const queryParams = params || { all: 'true' };
    return fetchPaginatedData('causali', queryParams);
};
export const getCodiciIva = (params) => fetchPaginatedData('codici-iva', params);
export const getCondizioniPagamento = (params) => fetchPaginatedData('condizioni-pagamento', params);
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
export const getDatabaseStats = async () => {
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
export const fetchJson = async (url, options) => {
    const response = await fetch(url, {
    // ... existing code ...
    });
    // ... existing code ...
};
