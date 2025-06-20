import { DashboardData } from '@/types';

/**
 * Recupera e aggrega i dati necessari per la dashboard di controllo di gestione
 * chiamando l'endpoint API del server.
 * @returns Una Promise che risolve con l'oggetto `DashboardData`.
 */
export const getDashboardData = async (): Promise<DashboardData> => {
  console.log('Chiamata API dashboard...');

  try {
    const response = await fetch('/api/dashboard');
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.message || `Errore HTTP: ${response.status}`);
      } catch (e) {
        throw new Error(`Risposta non JSON dal server: ${errorText}`);
      }
    }
    
    const data = await response.json();
    console.log('Dati dashboard ricevuti:', data);
    
    return data;
  } catch (error) {
    console.error('Errore nel recupero dati dashboard:', error);
    throw error;
  }
}; 