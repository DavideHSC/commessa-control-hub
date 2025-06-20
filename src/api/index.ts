import { 
  commesse, 
  vociAnalitiche, 
  pianoDeiConti, 
  scrittureContabili,
} from '@/data/mock';
import { 
  Commessa, 
  VoceAnalitica, 
  Conto, 
  ScritturaContabile,
  CausaleContabile
} from '@/types';

const API_BASE_URL = '/api';

// Simula un ritardo di rete per un'esperienza più realistica
const networkDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- API Functions ---

export const getCommesse = async (): Promise<Commessa[]> => {
  await networkDelay(50);
  return Promise.resolve(commesse);
};

export const getVociAnalitiche = async (): Promise<VoceAnalitica[]> => {
  await networkDelay(50);
  return Promise.resolve(vociAnalitiche);
};

export const getPianoDeiConti = async (): Promise<Conto[]> => {
  await networkDelay(50);
  return Promise.resolve(pianoDeiConti);
};

export const getCausaliContabili = async (): Promise<CausaleContabile[]> => {
  const response = await fetch(`${API_BASE_URL}/causali`);
  if (!response.ok) {
    throw new Error('Errore nel caricamento delle causali contabili');
  }
  return response.json();
};

export const getScrittureContabiliMock = async (): Promise<ScritturaContabile[]> => {
  await networkDelay(150);
  return Promise.resolve(scrittureContabili);
};

// In futuro aggiungeremo qui le funzioni per recuperare e salvare le scritture contabili. 

// Qui potremmo aggiungere funzioni per creare/aggiornare/eliminare dati,
// che in un'app reale farebbero chiamate a un backend API. 