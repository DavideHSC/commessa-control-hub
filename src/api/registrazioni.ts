import { ScritturaContabile } from "@/types";
import { scrittureContabili as mockScritture } from "@/data/mock";

// --- Inizializzazione di un "database" fittizio nel localStorage ---
const DB_KEY = 'commessa_hub_db';

let scrittureInMemoria: ScritturaContabile[] = [];

const initializeDb = () => {
  try {
    const dataFromStorage = localStorage.getItem(DB_KEY);
    if (dataFromStorage) {
      scrittureInMemoria = JSON.parse(dataFromStorage);
    } else {
      // Se non c'è nulla, inizializza con i dati mock e salva
      scrittureInMemoria = [...mockScritture];
      localStorage.setItem(DB_KEY, JSON.stringify(scrittureInMemoria));
    }
  } catch (error) {
    console.error("Errore nell'inizializzazione del DB in localStorage:", error);
    // Fallback ai dati mock in caso di errore
    scrittureInMemoria = [...mockScritture];
  }
};

const persistDb = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(scrittureInMemoria));
  } catch (error) {
    console.error("Errore nel salvataggio del DB in localStorage:", error);
  }
};

// Inizializza il DB all'avvio del modulo
initializeDb();
// -------------------------------------------------------------------

/**
 * Recupera tutte le scritture contabili.
 * Simula una chiamata API GET.
 * @returns Una Promise che si risolve con l'array di tutte le scritture.
 */
export const getRegistrazioni = (): Promise<ScritturaContabile[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...scrittureInMemoria]);
    }, 300);
  });
};

/**
 * Trova una singola scrittura contabile tramite il suo ID.
 * Simula una chiamata API GET by ID.
 * @param id L'ID della scrittura da trovare.
 * @returns Una Promise che si risolve con la scrittura trovata o `null`.
 */
export const getRegistrazioneById = (id: string): Promise<ScritturaContabile | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const registrazione = scrittureInMemoria.find(r => r.id === id) || null;
      resolve(registrazione);
    }, 300);
  });
};

/**
 * Aggiunge una nuova scrittura contabile.
 * Simula una chiamata API POST.
 * @param scritturaData I dati della nuova scrittura.
 * @returns Una Promise che si risolve con la scrittura appena creata.
 */
export const addRegistrazione = (scritturaData: Omit<ScritturaContabile, 'id'>): Promise<ScritturaContabile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const nuovaScrittura: ScritturaContabile = {
        ...scritturaData,
        id: `reg-${Date.now()}`,
      };
      scrittureInMemoria.push(nuovaScrittura);
      persistDb();
      resolve(nuovaScrittura);
    }, 500);
  });
};

/**
 * Aggiorna una scrittura contabile esistente.
 * Simula una chiamata API PUT.
 * @param registrazione La scrittura contabile da aggiornare.
 * @returns Una Promise che si risolve con la scrittura aggiornata.
 */
export const updateRegistrazione = (registrazione: ScritturaContabile): Promise<ScritturaContabile> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = scrittureInMemoria.findIndex(r => r.id === registrazione.id);
      if (index !== -1) {
        scrittureInMemoria[index] = registrazione;
        persistDb();
        resolve(scrittureInMemoria[index]);
      } else {
        reject(new Error("Registrazione non trovata"));
      }
    }, 500);
  });
};

/**
 * Elimina una scrittura contabile.
 * Simula una chiamata API DELETE.
 * @param id L'ID della scrittura da eliminare.
 * @returns Una Promise che si risolve quando l'eliminazione ha successo.
 */
export const deleteRegistrazione = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = scrittureInMemoria.findIndex(r => r.id === id);
      if (index !== -1) {
        scrittureInMemoria.splice(index, 1);
        persistDb();
        resolve();
      } else {
        reject(new Error("Registrazione non trovata per l'eliminazione"));
      }
    }, 500);
  });
};