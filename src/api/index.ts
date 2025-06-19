import { 
  commesse, 
  vociAnalitiche, 
  pianoDeiConti, 
  scrittureContabili,
  causaliContabili 
} from '@/data/mock';
import { 
  Commessa, 
  VoceAnalitica, 
  Conto, 
  ScritturaContabile,
  CausaleContabile
} from '@/types';

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
  await networkDelay(50);
  return Promise.resolve(causaliContabili);
};

export const getScrittureContabiliMock = async (): Promise<ScritturaContabile[]> => {
  await networkDelay(150);
  return Promise.resolve(scrittureContabili);
};

// In futuro aggiungeremo qui le funzioni per recuperare e salvare le scritture contabili. 

// Qui potremmo aggiungere funzioni per creare/aggiornare/eliminare dati,
// che in un'app reale farebbero chiamate a un backend API. 