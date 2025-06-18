import { centriDiCosto, pianoDeiConti, commesse, causaliContabili } from '../data/mock';
import { CentroDiCosto, Conto, Commessa, CausaleContabile } from '../types';

/**
 * Simula una chiamata API asincrona con un ritardo.
 * @param data I dati da restituire.
 * @param delay Il ritardo in millisecondi.
 */
const fetchMockData = <T>(data: T, delay = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

// --- API Functions ---

export const getCentriDiCosto = (): Promise<CentroDiCosto[]> => {
  return fetchMockData(centriDiCosto);
};

export const getPianoDeiConti = (): Promise<Conto[]> => {
  return fetchMockData(pianoDeiConti);
};

export const getCommesse = (): Promise<Commessa[]> => {
  return fetchMockData(commesse);
};

export const getCausaliContabili = (): Promise<CausaleContabile[]> => {
  return fetchMockData(causaliContabili);
};

// In futuro aggiungeremo qui le funzioni per recuperare e salvare le scritture contabili. 