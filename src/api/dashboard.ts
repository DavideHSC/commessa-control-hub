import { DashboardData } from '@/types';

/**
 * Recupera e aggrega i dati necessari per la dashboard di controllo di gestione
 * chiamando l'endpoint API del server.
 * @returns Una Promise che risolve con l'oggetto `DashboardData`.
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  console.log('Chiamata API dashboard...');

  try {
    const response = await fetch('http://localhost:3001/api/dashboard');
    
    if (!response.ok) {
      throw new Error(`Errore HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Dati dashboard ricevuti:', data);
    
    return data;
  } catch (error) {
    console.error('Errore nel recupero dati dashboard:', error);
    throw error;
  }
}; 